from rest_framework import serializers
from .models import Department, Employee, Category, SystemSettings


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.ReadOnlyField()

    class Meta:
        model = Department
        fields = ["id", "name", "code", "head", "parent_department", "employee_count", "status",
                  "created_at", "updated_at"]


class EmployeeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = ["id", "user", "username", "full_name", "department", "designation", "gender",
                   "date_of_birth", "date_joined_org", "status", "total_xp", "total_points",
                   "completed_challenge_count"]

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "type", "status"]


class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ["auto_emission_calculation", "evidence_required_for_csr", "badge_auto_award",
                  "weight_environmental", "weight_social", "weight_governance"]
