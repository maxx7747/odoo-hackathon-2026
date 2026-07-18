from django.contrib import admin
from .models import Department, Employee, Category, SystemSettings


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "head", "parent_department", "employee_count", "status"]
    list_filter = ["status"]
    search_fields = ["name", "code"]


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ["user", "department", "designation", "total_xp", "total_points", "status"]
    list_filter = ["department", "status", "gender"]
    search_fields = ["user__username", "user__first_name", "user__last_name"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "type", "status"]
    list_filter = ["type", "status"]


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ["auto_emission_calculation", "evidence_required_for_csr", "badge_auto_award",
                     "weight_environmental", "weight_social", "weight_governance"]

    def has_add_permission(self, request):
        return not SystemSettings.objects.exists()
