from datetime import date

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import DepartmentScore, OrganizationScore
from .serializers import DepartmentScoreSerializer, OrganizationScoreSerializer
from .services import calculate_department_scores


class DepartmentScoreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DepartmentScore.objects.select_related("department").all()
    serializer_class = DepartmentScoreSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["department", "period"]

    @action(detail=False, methods=["get"])
    def rankings(self, request):
        """Department ESG rankings for a given period (?period=YYYY-MM-DD), highest total_score first."""
        period = request.query_params.get("period")
        qs = self.get_queryset()
        if period:
            qs = qs.filter(period=period)
        qs = qs.order_by("-total_score")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class OrganizationScoreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = OrganizationScore.objects.all()
    serializer_class = OrganizationScoreSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["period"]


class RecalculateScoresView(APIView):
    """
    POST { "period": "2026-07-01", "period_start": "2026-07-01", "period_end": "2026-07-31" }
    Recomputes Department/Organization scores for the given reporting window.
    Typically scheduled monthly/quarterly via a management command instead.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            period = date.fromisoformat(request.data["period"])
            period_start = date.fromisoformat(request.data.get("period_start", request.data["period"]))
            period_end = date.fromisoformat(request.data["period_end"])
        except (KeyError, ValueError):
            return Response(
                {"detail": "Provide period, period_start, period_end as YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = calculate_department_scores(period, period_start, period_end)
        return Response(DepartmentScoreSerializer(results, many=True).data)
