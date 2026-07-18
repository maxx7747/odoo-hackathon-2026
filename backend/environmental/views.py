from django.db.models import Sum
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import SystemSettings
from .models import EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction
from .serializers import (
    EmissionFactorSerializer, ProductESGProfileSerializer,
    EnvironmentalGoalSerializer, CarbonTransactionSerializer,
)


class EmissionFactorViewSet(viewsets.ModelViewSet):
    queryset = EmissionFactor.objects.all()
    serializer_class = EmissionFactorSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["source_type", "status"]


class ProductESGProfileViewSet(viewsets.ModelViewSet):
    queryset = ProductESGProfile.objects.all()
    serializer_class = ProductESGProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "recyclable"]


class EnvironmentalGoalViewSet(viewsets.ModelViewSet):
    queryset = EnvironmentalGoal.objects.all()
    serializer_class = EnvironmentalGoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["department", "status"]


class CarbonTransactionViewSet(viewsets.ModelViewSet):
    queryset = CarbonTransaction.objects.select_related("department", "emission_factor").all()
    serializer_class = CarbonTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["source_type", "department", "is_auto_calculated"]

    @action(detail=False, methods=["get"])
    def dashboard(self, request):
        """Environmental Dashboard: totals by source and by department."""
        qs = self.filter_queryset(self.get_queryset())
        total = qs.aggregate(total=Sum("calculated_emission"))["total"] or 0
        by_source = list(qs.values("source_type").annotate(total=Sum("calculated_emission")).order_by("-total"))
        by_department = list(
            qs.values("department__name").annotate(total=Sum("calculated_emission")).order_by("-total")
        )
        return Response({
            "total_emissions_kgco2e": total,
            "by_source_type": by_source,
            "by_department": by_department,
        })


class AutoEmissionIngestView(APIView):
    """
    Endpoint the ERP (Purchase/Manufacturing/Expense/Fleet modules) calls whenever an
    operational transaction happens. If Settings -> auto_emission_calculation is ON,
    this automatically creates the matching CarbonTransaction using the linked Emission
    Factor. Otherwise it's a no-op (transaction must be entered manually via the
    CarbonTransaction endpoint).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        settings_obj = SystemSettings.load()
        if not settings_obj.auto_emission_calculation:
            return Response(
                {"detail": "Auto emission calculation is disabled in Settings."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        required = ["source_type", "source_reference", "emission_factor", "quantity", "transaction_date"]
        missing = [f for f in required if f not in request.data]
        if missing:
            return Response({"detail": f"Missing fields: {missing}"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = CarbonTransactionSerializer(data={
            **request.data,
            "is_auto_calculated": True,
        })
        serializer.is_valid(raise_exception=True)
        serializer.save(is_auto_calculated=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
