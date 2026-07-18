"""
ESG scoring engine.

Each pillar score is 0-100. The exact formulas below are a sensible starting
point (documented so the team can tune weights/thresholds per the judging
rubric) - swap in more accurate business logic as needed without touching
anything else in the app, since everything else consumes the resulting
DepartmentScore/OrganizationScore rows only.
"""
from datetime import date

from django.db.models import Sum, Count, Q

from core.models import Department, SystemSettings
from environmental.models import CarbonTransaction, EnvironmentalGoal
from social.models import EmployeeParticipation, TrainingCompletion
from governance.models import PolicyAcknowledgement, ComplianceIssue
from .models import DepartmentScore, OrganizationScore


def _environmental_score(department, period_start, period_end):
    goals = EnvironmentalGoal.objects.filter(
        Q(department=department) | Q(department__isnull=True),
        start_date__lte=period_end, end_date__gte=period_start,
    )
    if goals.exists():
        pct = [min(float(g.progress_percent), 100) for g in goals]
        return sum(pct) / len(pct)
    # Fallback: fewer emissions relative to org average this period = better score.
    dept_emissions = CarbonTransaction.objects.filter(
        department=department, transaction_date__range=(period_start, period_end)
    ).aggregate(total=Sum("calculated_emission"))["total"] or 0
    return 100 if dept_emissions == 0 else max(0, 100 - float(dept_emissions) / 100)


def _social_score(department, period_start, period_end):
    participations = EmployeeParticipation.objects.filter(
        employee__department=department, completion_date__range=(period_start, period_end),
    )
    total = participations.count()
    approved = participations.filter(approval_status="approved").count()
    participation_rate = (approved / total * 100) if total else 0

    trainings = TrainingCompletion.objects.filter(
        employee__department=department, completion_date__range=(period_start, period_end),
    )
    t_total = trainings.count()
    t_completed = trainings.filter(status="completed").count()
    training_rate = (t_completed / t_total * 100) if t_total else 100

    return (participation_rate + training_rate) / 2


def _governance_score(department, period_start, period_end):
    acks = PolicyAcknowledgement.objects.filter(
        employee__department=department, updated_at__date__range=(period_start, period_end),
    )
    ack_total = acks.count()
    ack_done = acks.filter(status="acknowledged").count()
    ack_rate = (ack_done / ack_total * 100) if ack_total else 100

    issues = ComplianceIssue.objects.filter(
        owner__department=department, created_at__date__range=(period_start, period_end),
    )
    issue_total = issues.count()
    resolved = issues.filter(status="resolved").count()
    resolution_rate = (resolved / issue_total * 100) if issue_total else 100

    return (ack_rate + resolution_rate) / 2


def calculate_department_scores(period: date, period_start: date, period_end: date):
    settings_obj = SystemSettings.load()
    we, ws, wg = float(settings_obj.weight_environmental), float(settings_obj.weight_social), float(settings_obj.weight_governance)

    results = []
    for department in Department.objects.filter(status="active"):
        e = round(_environmental_score(department, period_start, period_end), 2)
        s = round(_social_score(department, period_start, period_end), 2)
        g = round(_governance_score(department, period_start, period_end), 2)

        score, _ = DepartmentScore.objects.update_or_create(
            department=department, period=period,
            defaults={"environmental_score": e, "social_score": s, "governance_score": g},
        )
        score.compute_total(we, ws, wg)
        score.save(update_fields=["total_score"])
        results.append(score)

    if results:
        org_e = sum(float(r.environmental_score) for r in results) / len(results)
        org_s = sum(float(r.social_score) for r in results) / len(results)
        org_g = sum(float(r.governance_score) for r in results) / len(results)
        total_weight = we + ws + wg or 1
        overall = (org_e * we + org_s * ws + org_g * wg) / total_weight

        OrganizationScore.objects.update_or_create(
            period=period,
            defaults={
                "environmental_score": round(org_e, 2),
                "social_score": round(org_s, 2),
                "governance_score": round(org_g, 2),
                "overall_score": round(overall, 2),
            },
        )

    return results
