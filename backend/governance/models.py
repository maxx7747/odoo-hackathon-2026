from django.db import models
from django.utils import timezone
from core.models import TimeStampedModel, Department, Employee


class ESGPolicy(TimeStampedModel):
    CATEGORY_CHOICES = [("environmental", "Environmental"), ("social", "Social"), ("governance", "Governance")]
    STATUS_CHOICES = [("draft", "Draft"), ("active", "Active"), ("retired", "Retired")]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=15, choices=CATEGORY_CHOICES, default="governance")
    version = models.CharField(max_length=20, default="1.0")
    effective_date = models.DateField()
    document = models.FileField(upload_to="policy_documents/", null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="draft")

    def __str__(self):
        return f"{self.title} v{self.version}"


class PolicyAcknowledgement(TimeStampedModel):
    STATUS_CHOICES = [("pending", "Pending"), ("acknowledged", "Acknowledged"), ("overdue", "Overdue")]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="policy_acknowledgements")
    policy = models.ForeignKey(ESGPolicy, on_delete=models.CASCADE, related_name="acknowledgements")
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="pending")

    class Meta:
        unique_together = ["employee", "policy"]

    def __str__(self):
        return f"{self.employee} - {self.policy} ({self.status})"

    def acknowledge(self):
        self.status = "acknowledged"
        self.acknowledged_at = timezone.now()
        self.save()


class Audit(TimeStampedModel):
    STATUS_CHOICES = [
        ("planned", "Planned"), ("in_progress", "In Progress"),
        ("completed", "Completed"), ("cancelled", "Cancelled"),
    ]

    title = models.CharField(max_length=200)
    scope = models.TextField(blank=True)
    auditor = models.CharField(max_length=150)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name="audits")
    audit_date = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="planned")
    findings_summary = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} ({self.audit_date})"


class ComplianceIssue(TimeStampedModel):
    SEVERITY_CHOICES = [("low", "Low"), ("medium", "Medium"), ("high", "High"), ("critical", "Critical")]
    STATUS_CHOICES = [("open", "Open"), ("in_progress", "In Progress"), ("resolved", "Resolved"), ("overdue", "Overdue")]

    audit = models.ForeignKey(Audit, on_delete=models.CASCADE, related_name="compliance_issues")
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default="medium")
    description = models.TextField()
    owner = models.ForeignKey(Employee, on_delete=models.PROTECT, related_name="owned_compliance_issues")
    due_date = models.DateField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="open")
    resolved_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["due_date"]

    def __str__(self):
        return f"{self.description[:40]} ({self.severity})"

    @property
    def is_overdue(self):
        return self.status in ("open", "in_progress") and self.due_date < timezone.localdate()
