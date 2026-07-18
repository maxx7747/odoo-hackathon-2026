import csv
import io

from django.db.models import Sum, Q
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from environmental.models import CarbonTransaction
from social.models import EmployeeParticipation, TrainingCompletion, DiversityMetric
from governance.models import PolicyAcknowledgement, Audit, ComplianceIssue
from gamification.models import ChallengeParticipation
from scoring.models import DepartmentScore, OrganizationScore


def _apply_common_filters(qs, field_map, department=None, date_start=None, date_end=None,
                           employee=None, challenge=None):
    if department and field_map.get("department"):
        qs = qs.filter(**{field_map["department"]: department})
    if employee and field_map.get("employee"):
        qs = qs.filter(**{field_map["employee"]: employee})
    if challenge and field_map.get("challenge"):
        qs = qs.filter(**{field_map["challenge"]: challenge})
    if date_start and date_end and field_map.get("date"):
        qs = qs.filter(**{f'{field_map["date"]}__range': (date_start, date_end)})
    return qs


def environmental_report(department=None, date_start=None, date_end=None):
    qs = CarbonTransaction.objects.select_related("department", "emission_factor")
    qs = _apply_common_filters(qs, {"department": "department", "date": "transaction_date"},
                                department=department, date_start=date_start, date_end=date_end)
    total = qs.aggregate(total=Sum("calculated_emission"))["total"] or 0
    rows = [
        [tx.transaction_date, tx.get_source_type_display(), tx.department.name if tx.department else "-",
         tx.emission_factor.name, str(tx.quantity), str(tx.calculated_emission)]
        for tx in qs.order_by("-transaction_date")[:2000]
    ]
    headers = ["Date", "Source", "Department", "Emission Factor", "Quantity", "kgCO2e"]
    return {"title": "Environmental Report", "headers": headers, "rows": rows,
            "summary": f"Total emissions: {total} kgCO2e"}


def social_report(department=None, date_start=None, date_end=None, employee=None):
    qs = EmployeeParticipation.objects.select_related("employee", "activity")
    qs = _apply_common_filters(qs, {"department": "employee__department", "date": "completion_date",
                                     "employee": "employee"},
                                department=department, date_start=date_start, date_end=date_end, employee=employee)
    rows = [
        [p.employee, p.activity.title, p.approval_status, p.points_earned, p.completion_date]
        for p in qs.order_by("-completion_date")[:2000]
    ]
    headers = ["Employee", "CSR Activity", "Approval", "Points Earned", "Completion Date"]
    return {"title": "Social Report", "headers": headers, "rows": rows,
            "summary": f"{qs.filter(approval_status='approved').count()} approved participations of {qs.count()} total"}


def governance_report(department=None, date_start=None, date_end=None):
    issues = ComplianceIssue.objects.select_related("audit", "owner")
    issues = _apply_common_filters(issues, {"department": "owner__department", "date": "created_at__date"},
                                    department=department, date_start=date_start, date_end=date_end)
    rows = [
        [i.audit.title, i.severity, i.owner, i.due_date, i.status]
        for i in issues.order_by("due_date")[:2000]
    ]
    headers = ["Audit", "Severity", "Owner", "Due Date", "Status"]
    overdue = sum(1 for i in issues if i.is_overdue)
    return {"title": "Governance Report", "headers": headers, "rows": rows,
            "summary": f"{overdue} overdue compliance issue(s) of {issues.count()} total"}


def esg_summary_report(department=None, period=None):
    qs = DepartmentScore.objects.select_related("department")
    if department:
        qs = qs.filter(department=department)
    if period:
        qs = qs.filter(period=period)
    rows = [
        [s.department.name, s.period, s.environmental_score, s.social_score, s.governance_score, s.total_score]
        for s in qs.order_by("-period", "-total_score")[:2000]
    ]
    headers = ["Department", "Period", "Environmental", "Social", "Governance", "Total Score"]
    org = OrganizationScore.objects.filter(period=period).first() if period else OrganizationScore.objects.first()
    summary = f"Organization overall ESG score: {org.overall_score}" if org else "No organization score available yet."
    return {"title": "ESG Summary Report", "headers": headers, "rows": rows, "summary": summary}


def custom_report(module="all", department=None, employee=None, challenge=None,
                   esg_category=None, date_start=None, date_end=None):
    """Combines the Custom Report Builder filters into one row-set spanning selected modules."""
    sections = []
    if module in ("environmental", "all") and esg_category in ("", None, "environmental"):
        sections.append(environmental_report(department, date_start, date_end))
    if module in ("social", "all") and esg_category in ("", None, "social"):
        sections.append(social_report(department, date_start, date_end, employee))
    if module in ("governance", "all") and esg_category in ("", None, "governance"):
        sections.append(governance_report(department, date_start, date_end))
    if module in ("gamification", "all") and challenge:
        cp = ChallengeParticipation.objects.filter(challenge=challenge)
        rows = [[c.employee, c.challenge.title, c.progress, c.approval, c.xp_awarded] for c in cp]
        sections.append({"title": "Challenge Participation", "headers":
                          ["Employee", "Challenge", "Progress %", "Approval", "XP Awarded"], "rows": rows,
                          "summary": f"{cp.count()} participant(s)"})
    return sections


# ---------------------------------------------------------------------------
# Exporters
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# Exporters — each accepts either a single report dict or a list of report
# dicts (sections), since the Custom Report Builder can span multiple modules.
# ---------------------------------------------------------------------------

def _as_sections(report_or_sections):
    if isinstance(report_or_sections, dict):
        return [report_or_sections]
    return list(report_or_sections)


def export_csv(report_or_sections):
    sections = _as_sections(report_or_sections)
    buf = io.StringIO()
    writer = csv.writer(buf)
    for i, report in enumerate(sections):
        if i:
            writer.writerow([])
        writer.writerow([report["title"]])
        writer.writerow([report.get("summary", "")])
        writer.writerow([])
        writer.writerow(report["headers"])
        for row in report["rows"]:
            writer.writerow(row)
    return buf.getvalue().encode("utf-8")


def export_excel(report_or_sections):
    sections = _as_sections(report_or_sections)
    wb = Workbook()
    wb.remove(wb.active)
    for report in sections:
        ws = wb.create_sheet(title=report["title"][:31])
        ws.append([report["title"]])
        ws.append([report.get("summary", "")])
        ws.append([])
        ws.append(report["headers"])
        for row in report["rows"]:
            ws.append([str(v) for v in row])
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def export_pdf(report_or_sections):
    sections = _as_sections(report_or_sections)
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []
    for report in sections:
        elements += [Paragraph(report["title"], styles["Title"]), Spacer(1, 8),
                      Paragraph(report.get("summary", ""), styles["Normal"]), Spacer(1, 12)]
        table_data = [report["headers"]] + [[str(v) for v in row] for row in report["rows"]]
        table = Table(table_data, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2E7D32")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F8E9")]),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 20))
    doc.build(elements)
    return buf.getvalue()


EXPORTERS = {"csv": (export_csv, "text/csv", "csv"),
             "excel": (export_excel, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "xlsx"),
             "pdf": (export_pdf, "application/pdf", "pdf")}
