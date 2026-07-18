from rest_framework import serializers
from core.models import SystemSettings
from .models import CSRActivity, EmployeeParticipation, DiversityMetric, TrainingCompletion


class CSRActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CSRActivity
        fields = ["id", "title", "category", "description", "department", "start_date", "end_date",
                  "points_value", "status"]


class EmployeeParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeParticipation
        fields = ["id", "employee", "activity", "proof", "approval_status", "points_earned", "completion_date"]
        read_only_fields = ["points_earned"]

    def validate(self, attrs):
        approval_status = attrs.get("approval_status", getattr(self.instance, "approval_status", "pending"))
        proof = attrs.get("proof", getattr(self.instance, "proof", None))
        if approval_status == "approved":
            settings_obj = SystemSettings.load()
            if settings_obj.evidence_required_for_csr and not proof:
                raise serializers.ValidationError(
                    "Evidence Requirement is enabled: a proof file is required to approve this participation."
                )
        return attrs


class DiversityMetricSerializer(serializers.ModelSerializer):
    total = serializers.ReadOnlyField()

    class Meta:
        model = DiversityMetric
        fields = ["id", "department", "period", "male_count", "female_count", "non_binary_count",
                  "undisclosed_count", "total"]


class TrainingCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingCompletion
        fields = ["id", "employee", "training_name", "completion_date", "status"]
