from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue
from .serializers import (
    ESGPolicySerializer, PolicyAcknowledgementSerializer, AuditSerializer, ComplianceIssueSerializer,
)


class ESGPolicyViewSet(viewsets.ModelViewSet):
    queryset = ESGPolicy.objects.all()
    serializer_class = ESGPolicySerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["category", "status"]


class PolicyAcknowledgementViewSet(viewsets.ModelViewSet):
    queryset = PolicyAcknowledgement.objects.select_related("employee", "policy").all()
    serializer_class = PolicyAcknowledgementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["employee", "policy", "status"]

    @action(detail=True, methods=["post"])
    def acknowledge(self, request, pk=None):
        ack = self.get_object()
        ack.acknowledge()
        return Response(PolicyAcknowledgementSerializer(ack).data)


class AuditViewSet(viewsets.ModelViewSet):
    queryset = Audit.objects.select_related("department").all()
    serializer_class = AuditSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "department"]


class ComplianceIssueViewSet(viewsets.ModelViewSet):
    queryset = ComplianceIssue.objects.select_related("audit", "owner").all()
    serializer_class = ComplianceIssueSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["severity", "status", "owner"]

    @action(detail=False, methods=["get"])
    def overdue(self, request):
        from django.utils import timezone
        qs = self.get_queryset().filter(status__in=["open", "in_progress"], due_date__lt=timezone.localdate())
        page = self.paginate_queryset(qs)
        serializer = self.get_serializer(page or qs, many=True)
        return self.get_paginated_response(serializer.data) if page is not None else Response(serializer.data)
