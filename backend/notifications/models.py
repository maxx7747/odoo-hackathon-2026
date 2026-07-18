from django.db import models
from core.models import TimeStampedModel, Employee


class NotificationType(models.TextChoices):
    COMPLIANCE_ISSUE_RAISED = "compliance_issue_raised", "New compliance issue raised"
    CSR_APPROVAL_DECISION = "csr_approval_decision", "CSR approval decision"
    CHALLENGE_APPROVAL_DECISION = "challenge_approval_decision", "Challenge approval decision"
    POLICY_ACK_REMINDER = "policy_ack_reminder", "Policy acknowledgement reminder"
    BADGE_UNLOCKED = "badge_unlocked", "Badge unlocked"
    COMPLIANCE_ISSUE_OVERDUE = "compliance_issue_overdue", "Compliance issue overdue"


class Notification(TimeStampedModel):
    CHANNEL_CHOICES = [("in_app", "In-app"), ("email", "Email"), ("both", "Both")]

    recipient = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=40, choices=NotificationType.choices)
    message = models.CharField(max_length=255)
    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES, default="in_app")
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.get_type_display()}] {self.recipient}: {self.message[:40]}"


class NotificationSetting(TimeStampedModel):
    """Per-employee opt-in/out for each notification type (Settings -> Notification Settings)."""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="notification_settings")
    type = models.CharField(max_length=40, choices=NotificationType.choices)
    in_app_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=True)

    class Meta:
        unique_together = ["employee", "type"]

    def __str__(self):
        return f"{self.employee} - {self.get_type_display()}"
