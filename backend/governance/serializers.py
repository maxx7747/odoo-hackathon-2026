from rest_framework import serializers
from .models import ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue


class ESGPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = ESGPolicy
        fields = ["id", "title", "description", "category", "version", "effective_date", "document", "status"]


class PolicyAcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = PolicyAcknowledgement
        fields = ["id", "employee", "policy", "acknowledged_at", "status"]
        read_only_fields = ["acknowledged_at"]


class AuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Audit
        fields = ["id", "title", "scope", "auditor", "department", "audit_date", "status", "findings_summary"]


class ComplianceIssueSerializer(serializers.ModelSerializer):
    is_overdue = serializers.ReadOnlyField()

    class Meta:
        model = ComplianceIssue
        fields = ["id", "audit", "severity", "description", "owner", "due_date", "status",
                  "resolved_date", "is_overdue"]
