from datetime import date, timedelta

from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Department, Employee, Category, SystemSettings
from .serializers import (
    DepartmentSerializer, EmployeeSerializer, CategorySerializer, SystemSettingsSerializer,
)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "parent_department"]
    search_fields = ["name", "code"]


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related("user", "department").all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["department", "status", "gender"]
    search_fields = ["user__username", "user__first_name", "user__last_name"]

    @action(detail=False, methods=["get"])
    def leaderboard(self, request):
        """Global leaderboard ranked by total_xp."""
        top = self.get_queryset().order_by("-total_xp")[:50]
        data = [
            {
                "employee_id": e.id,
                "name": e.user.get_full_name() or e.user.username,
                "department": e.department.name if e.department else None,
                "total_xp": e.total_xp,
                "total_points": e.total_points,
                "completed_challenge_count": e.completed_challenge_count,
            }
            for e in top
        ]
        return Response(data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["type", "status"]


class SystemSettingsView(APIView):
    """Single-object endpoint: GET/PATCH /api/settings/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        obj = SystemSettings.load()
        return Response(SystemSettingsSerializer(obj).data)

    def patch(self, request):
        obj = SystemSettings.load()
        serializer = SystemSettingsSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class DashboardOverviewView(APIView):
    """
    Aggregate view powering the frontend Overview page: latest org/department
    ESG scores, total emissions, compliance/challenge counters, a 6-month
    emissions trend, and the per-department score breakdown.
    GET /api/core/dashboard-overview/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Local imports to avoid any import-order issues at app-loading time.
        from environmental.models import CarbonTransaction
        from social.models import EmployeeParticipation
        from governance.models import ComplianceIssue
        from gamification.models import Challenge, ChallengeParticipation
        from scoring.models import DepartmentScore, OrganizationScore

        latest_org = OrganizationScore.objects.order_by("-period").first()
        if latest_org:
            scores = {
                "environmental": round(float(latest_org.environmental_score)),
                "social": round(float(latest_org.social_score)),
                "governance": round(float(latest_org.governance_score)),
                "total": round(float(latest_org.overall_score)),
            }
            dept_scores_qs = DepartmentScore.objects.filter(
                period=latest_org.period
            ).select_related("department")
        else:
            scores = {"environmental": 0, "social": 0, "governance": 0, "total": 0}
            dept_scores_qs = DepartmentScore.objects.none()

        department_scores = [
            {
                "id": ds.id,
                "department": ds.department.name,
                "environmental": round(float(ds.environmental_score)),
                "social": round(float(ds.social_score)),
                "governance": round(float(ds.governance_score)),
                "total": round(float(ds.total_score)),
            }
            for ds in dept_scores_qs
        ]

        total_co2e = CarbonTransaction.objects.aggregate(total=Sum("calculated_emission"))["total"] or 0

        open_compliance_issues = ComplianceIssue.objects.exclude(status="resolved").count()
        overdue_issues = ComplianceIssue.objects.filter(status="overdue").count()
        active_challenges = Challenge.objects.filter(status="active").count()
        pending_approvals = (
            EmployeeParticipation.objects.filter(approval_status="pending").count()
            + ChallengeParticipation.objects.filter(approval="pending").count()
        )

        six_months_ago = date.today() - timedelta(days=180)
        trend_rows = (
            CarbonTransaction.objects.filter(transaction_date__gte=six_months_ago)
            .annotate(month=TruncMonth("transaction_date"))
            .values("month")
            .annotate(co2e=Sum("calculated_emission"))
            .order_by("month")
        )
        emissions_trend = [
            {"month": row["month"].strftime("%b"), "co2e": round(float(row["co2e"] or 0))}
            for row in trend_rows
        ]

        return Response({
            "scores": scores,
            "totalCO2e": round(float(total_co2e)),
            "openComplianceIssues": open_compliance_issues,
            "overdueIssues": overdue_issues,
            "activeChallenges": active_challenges,
            "pendingApprovals": pending_approvals,
            "emissionsTrend": emissions_trend,
            "departmentScores": department_scores,
        })
