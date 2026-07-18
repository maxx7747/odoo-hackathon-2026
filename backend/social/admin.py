from django.contrib import admin
from .models import CSRActivity, EmployeeParticipation, DiversityMetric, TrainingCompletion


@admin.register(CSRActivity)
class CSRActivityAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "department", "start_date", "end_date", "points_value", "status"]
    list_filter = ["status", "category", "department"]


@admin.register(EmployeeParticipation)
class EmployeeParticipationAdmin(admin.ModelAdmin):
    list_display = ["employee", "activity", "approval_status", "points_earned", "completion_date"]
    list_filter = ["approval_status"]


@admin.register(DiversityMetric)
class DiversityMetricAdmin(admin.ModelAdmin):
    list_display = ["department", "period", "male_count", "female_count", "non_binary_count",
                     "undisclosed_count", "total"]
    list_filter = ["department"]


@admin.register(TrainingCompletion)
class TrainingCompletionAdmin(admin.ModelAdmin):
    list_display = ["employee", "training_name", "completion_date", "status"]
    list_filter = ["status"]
