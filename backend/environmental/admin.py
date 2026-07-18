from django.contrib import admin
from .models import EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction


@admin.register(EmissionFactor)
class EmissionFactorAdmin(admin.ModelAdmin):
    list_display = ["name", "source_type", "unit", "factor_value", "status"]
    list_filter = ["source_type", "status"]


@admin.register(ProductESGProfile)
class ProductESGProfileAdmin(admin.ModelAdmin):
    list_display = ["product_name", "product_code", "emission_factor", "recyclable", "status"]
    search_fields = ["product_name", "product_code"]


@admin.register(EnvironmentalGoal)
class EnvironmentalGoalAdmin(admin.ModelAdmin):
    list_display = ["title", "department", "target_value", "current_value", "progress_percent", "status"]
    list_filter = ["status", "department"]


@admin.register(CarbonTransaction)
class CarbonTransactionAdmin(admin.ModelAdmin):
    list_display = ["source_type", "department", "quantity", "calculated_emission", "transaction_date", "is_auto_calculated"]
    list_filter = ["source_type", "department", "is_auto_calculated"]
    date_hierarchy = "transaction_date"
