import operator

from django.db import transaction
from core.models import SystemSettings
from notifications.models import NotificationType
from notifications.services import notify
from .models import Badge, EmployeeBadge, Reward, RewardRedemption

OPERATORS = {
    ">=": operator.ge, ">": operator.gt,
    "<=": operator.le, "<": operator.lt,
    "==": operator.eq,
}


def award_points(employee, points):
    if points <= 0:
        return
    employee.total_points = employee.total_points + points
    employee.save(update_fields=["total_points"])
    check_and_award_badges(employee)


def award_xp(employee, xp, increment_completed_challenges=False):
    if xp < 0:
        xp = 0
    employee.total_xp = employee.total_xp + xp
    if increment_completed_challenges:
        employee.completed_challenge_count = employee.completed_challenge_count + 1
    employee.save(update_fields=["total_xp", "completed_challenge_count"])
    check_and_award_badges(employee)


def check_and_award_badges(employee):
    """Evaluate every active Badge's unlock_rule against the employee's cached metrics."""
    settings_obj = SystemSettings.load()
    if not settings_obj.badge_auto_award:
        return

    already_earned_ids = set(
        EmployeeBadge.objects.filter(employee=employee).values_list("badge_id", flat=True)
    )
    metrics = {
        "total_xp": employee.total_xp,
        "total_points": employee.total_points,
        "completed_challenge_count": employee.completed_challenge_count,
    }

    for badge in Badge.objects.filter(status="active").exclude(id__in=already_earned_ids):
        rule = badge.unlock_rule or {}
        metric_name = rule.get("metric")
        op_symbol = rule.get("operator", ">=")
        threshold = rule.get("value")
        if metric_name not in metrics or threshold is None or op_symbol not in OPERATORS:
            continue
        if OPERATORS[op_symbol](metrics[metric_name], threshold):
            EmployeeBadge.objects.create(employee=employee, badge=badge)
            notify(
                employee, NotificationType.BADGE_UNLOCKED,
                f"You unlocked the '{badge.name}' badge!",
            )


class RedemptionError(Exception):
    pass


@transaction.atomic
def redeem_reward(employee, reward: Reward):
    reward = Reward.objects.select_for_update().get(pk=reward.pk)

    if reward.status != "active":
        raise RedemptionError("This reward is not currently active.")
    if reward.stock <= 0:
        raise RedemptionError("This reward is out of stock.")
    if employee.total_points < reward.points_required:
        raise RedemptionError("Not enough points to redeem this reward.")

    reward.stock -= 1
    reward.save(update_fields=["stock"])

    employee.total_points -= reward.points_required
    employee.save(update_fields=["total_points"])

    redemption = RewardRedemption.objects.create(
        employee=employee, reward=reward, points_deducted=reward.points_required,
    )
    return redemption
