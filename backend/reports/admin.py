from django.contrib import admin
from .models import SavedReport


@admin.register(SavedReport)
class SavedReportAdmin(admin.ModelAdmin):
    list_display = ["name", "module", "department", "employee", "esg_category", "export_format"]
    list_filter = ["module", "export_format"]
