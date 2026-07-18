from django.contrib import admin
from .models import DepartmentScore, OrganizationScore


@admin.register(DepartmentScore)
class DepartmentScoreAdmin(admin.ModelAdmin):
    list_display = ["department", "period", "environmental_score", "social_score",
                     "governance_score", "total_score"]
    list_filter = ["department"]
    date_hierarchy = "period"


@admin.register(OrganizationScore)
class OrganizationScoreAdmin(admin.ModelAdmin):
    list_display = ["period", "environmental_score", "social_score", "governance_score", "overall_score"]
    date_hierarchy = "period"
