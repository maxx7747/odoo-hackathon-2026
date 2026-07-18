from rest_framework import serializers
from .models import EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction


class EmissionFactorSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmissionFactor
        fields = ["id", "name", "source_type", "unit", "factor_value", "status"]


class ProductESGProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductESGProfile
        fields = ["id", "product_name", "product_code", "emission_factor", "sustainability_notes",
                  "recyclable", "status"]


class EnvironmentalGoalSerializer(serializers.ModelSerializer):
    progress_percent = serializers.ReadOnlyField()

    class Meta:
        model = EnvironmentalGoal
        fields = ["id", "title", "description", "department", "target_value", "current_value",
                  "unit", "start_date", "end_date", "status", "progress_percent"]


class CarbonTransactionSerializer(serializers.ModelSerializer):
    calculated_emission = serializers.ReadOnlyField()

    class Meta:
        model = CarbonTransaction
        fields = ["id", "source_type", "source_reference", "department", "emission_factor",
                  "quantity", "calculated_emission", "transaction_date", "is_auto_calculated"]
        read_only_fields = ["is_auto_calculated"]
