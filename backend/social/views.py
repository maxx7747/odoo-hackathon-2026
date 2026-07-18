from rest_framework import viewsets, permissions
from .models import CSRActivity, EmployeeParticipation, DiversityMetric, TrainingCompletion
from .serializers import (
    CSRActivitySerializer, EmployeeParticipationSerializer,
    DiversityMetricSerializer, TrainingCompletionSerializer,
)


class CSRActivityViewSet(viewsets.ModelViewSet):
    queryset = CSRActivity.objects.all()
    serializer_class = CSRActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "category", "department"]


class EmployeeParticipationViewSet(viewsets.ModelViewSet):
    queryset = EmployeeParticipation.objects.select_related("employee", "activity").all()
    serializer_class = EmployeeParticipationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["employee", "activity", "approval_status"]
    # Approving triggers points award + badge check + notification via social/signals.py


class DiversityMetricViewSet(viewsets.ModelViewSet):
    queryset = DiversityMetric.objects.select_related("department").all()
    serializer_class = DiversityMetricSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["department", "period"]


class TrainingCompletionViewSet(viewsets.ModelViewSet):
    queryset = TrainingCompletion.objects.select_related("employee").all()
    serializer_class = TrainingCompletionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["employee", "status"]
