from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from notifications.models import NotificationType
from notifications.services import notify
from gamification.services import award_points
from .models import EmployeeParticipation


@receiver(pre_save, sender=EmployeeParticipation)
def _stash_previous_approval(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._previous_approval = EmployeeParticipation.objects.get(pk=instance.pk).approval_status
        except EmployeeParticipation.DoesNotExist:
            instance._previous_approval = None
    else:
        instance._previous_approval = None


@receiver(post_save, sender=EmployeeParticipation)
def _handle_csr_approval(sender, instance, created, **kwargs):
    previous = getattr(instance, "_previous_approval", None)
    if previous == instance.approval_status:
        return

    if instance.approval_status == "approved":
        points = instance.activity.points_value
        instance.points_earned = points
        EmployeeParticipation.objects.filter(pk=instance.pk).update(points_earned=points)
        award_points(instance.employee, points)

    if instance.approval_status in ("approved", "rejected"):
        notify(
            instance.employee, NotificationType.CSR_APPROVAL_DECISION,
            f"Your participation in '{instance.activity.title}' was {instance.approval_status}.",
        )
