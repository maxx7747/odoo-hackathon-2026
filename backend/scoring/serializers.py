from rest_framework import serializers
from .models import DepartmentScore, OrganizationScore


class DepartmentScoreSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = DepartmentScore
        fields = ["id", "department", "department_name", "period", "environmental_score",
                  "social_score", "governance_score", "total_score"]


class OrganizationScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationScore
        fields = ["id", "period", "environmental_score", "social_score", "governance_score", "overall_score"]
