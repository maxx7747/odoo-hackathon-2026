from django.core.management.base import BaseCommand
from django.utils import timezone

from notifications.models import NotificationType
from notifications.services import notify
from governance.models import ComplianceIssue


class Command(BaseCommand):
    help = "Flags open/in-progress ComplianceIssues that passed their due_date, and notifies the owner."

    def handle(self, *args, **options):
        today = timezone.localdate()
        overdue_qs = ComplianceIssue.objects.filter(status__in=["open", "in_progress"], due_date__lt=today)
        count = 0
        for issue in overdue_qs:
            issue.status = "overdue"
            issue.save(update_fields=["status"])
            notify(
                issue.owner, NotificationType.COMPLIANCE_ISSUE_OVERDUE,
                f"Compliance issue overdue (due {issue.due_date}): {issue.description[:80]}",
            )
            count += 1
        self.stdout.write(self.style.SUCCESS(f"Flagged {count} overdue compliance issue(s)."))
