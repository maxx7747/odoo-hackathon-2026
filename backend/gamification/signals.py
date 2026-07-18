from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from notifications.models import NotificationType
from notifications.services import notify
from .models import ChallengeParticipation
from .services import award_xp


@receiver(pre_save, sender=ChallengeParticipation)
def _stash_previous_approval(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._previous_approval = ChallengeParticipation.objects.get(pk=instance.pk).approval
        except ChallengeParticipation.DoesNotExist:
            instance._previous_approval = None
    else:
        instance._previous_approval = None


@receiver(post_save, sender=ChallengeParticipation)
def _handle_challenge_approval(sender, instance, created, **kwargs):
    previous = getattr(instance, "_previous_approval", None)
    if previous == instance.approval:
        return  # no status change

    if instance.approval == "approved":
        xp = instance.challenge.xp
        instance.xp_awarded = xp
        ChallengeParticipation.objects.filter(pk=instance.pk).update(xp_awarded=xp)
        award_xp(instance.employee, xp, increment_completed_challenges=True)

    if instance.approval in ("approved", "rejected"):
        notify(
            instance.employee, NotificationType.CHALLENGE_APPROVAL_DECISION,
            f"Your participation in '{instance.challenge.title}' was {instance.approval}.",
        )
