from django.contrib import admin
from .models import Badge, EmployeeBadge, Reward, RewardRedemption, Challenge, ChallengeParticipation


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ["name", "unlock_rule", "status"]
    list_filter = ["status"]


@admin.register(EmployeeBadge)
class EmployeeBadgeAdmin(admin.ModelAdmin):
    list_display = ["employee", "badge", "awarded_date"]


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ["name", "points_required", "stock", "status"]
    list_filter = ["status"]


@admin.register(RewardRedemption)
class RewardRedemptionAdmin(admin.ModelAdmin):
    list_display = ["employee", "reward", "points_deducted", "status", "redeemed_at"]
    list_filter = ["status"]


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "xp", "difficulty", "deadline", "status"]
    list_filter = ["status", "difficulty", "category"]


@admin.register(ChallengeParticipation)
class ChallengeParticipationAdmin(admin.ModelAdmin):
    list_display = ["employee", "challenge", "progress", "approval", "xp_awarded"]
    list_filter = ["approval"]
