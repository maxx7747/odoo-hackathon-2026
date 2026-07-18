from django.db.models.signals import post_save
from django.dispatch import receiver

from notifications.models import NotificationType
from notifications.services import notify
from .models import ComplianceIssue


@receiver(post_save, sender=ComplianceIssue)
def _notify_on_new_issue(sender, instance, created, **kwargs):
    if created:
        notify(
            instance.owner, NotificationType.COMPLIANCE_ISSUE_RAISED,
            f"New compliance issue assigned to you: {instance.description[:80]}",
        )
