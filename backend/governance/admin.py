from django.contrib import admin
from .models import ESGPolicy, PolicyAcknowledgement, Audit, ComplianceIssue


@admin.register(ESGPolicy)
class ESGPolicyAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "version", "effective_date", "status"]
    list_filter = ["category", "status"]


@admin.register(PolicyAcknowledgement)
class PolicyAcknowledgementAdmin(admin.ModelAdmin):
    list_display = ["employee", "policy", "status", "acknowledged_at"]
    list_filter = ["status"]


@admin.register(Audit)
class AuditAdmin(admin.ModelAdmin):
    list_display = ["title", "department", "auditor", "audit_date", "status"]
    list_filter = ["status", "department"]


@admin.register(ComplianceIssue)
class ComplianceIssueAdmin(admin.ModelAdmin):
    list_display = ["description", "audit", "severity", "owner", "due_date", "status", "is_overdue"]
    list_filter = ["severity", "status"]
