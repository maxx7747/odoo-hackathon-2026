from rest_framework import serializers
from .models import Badge, EmployeeBadge, Reward, RewardRedemption, Challenge, ChallengeParticipation


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ["id", "name", "description", "unlock_rule", "icon", "status"]


class EmployeeBadgeSerializer(serializers.ModelSerializer):
    badge_name = serializers.CharField(source="badge.name", read_only=True)

    class Meta:
        model = EmployeeBadge
        fields = ["id", "employee", "badge", "badge_name", "awarded_date"]


class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ["id", "name", "description", "points_required", "stock", "status"]


class RewardRedemptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = RewardRedemption
        fields = ["id", "employee", "reward", "points_deducted", "status", "redeemed_at"]
        read_only_fields = ["points_deducted", "status", "redeemed_at"]


class ChallengeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Challenge
        fields = ["id", "title", "category", "description", "xp", "difficulty",
                  "evidence_required", "deadline", "status"]


class ChallengeParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeParticipation
        fields = ["id", "challenge", "employee", "progress", "proof", "approval", "xp_awarded"]
        read_only_fields = ["xp_awarded"]

    def validate(self, attrs):
        approval = attrs.get("approval", getattr(self.instance, "approval", "pending"))
        proof = attrs.get("proof", getattr(self.instance, "proof", None))
        challenge = attrs.get("challenge", getattr(self.instance, "challenge", None))
        if approval == "approved" and challenge and challenge.evidence_required and not proof:
            raise serializers.ValidationError(
                "This challenge requires evidence: a proof file must be attached to approve it."
            )
        return attrs
