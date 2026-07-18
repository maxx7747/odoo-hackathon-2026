from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    SavedReportViewSet, EnvironmentalReportView, SocialReportView,
    GovernanceReportView, ESGSummaryReportView, CustomReportView,
)

router = DefaultRouter()
router.register("saved-reports", SavedReportViewSet)

urlpatterns = router.urls + [
    path("environmental/", EnvironmentalReportView.as_view(), name="report-environmental"),
    path("social/", SocialReportView.as_view(), name="report-social"),
    path("governance/", GovernanceReportView.as_view(), name="report-governance"),
    path("esg-summary/", ESGSummaryReportView.as_view(), name="report-esg-summary"),
    path("custom/", CustomReportView.as_view(), name="report-custom"),
]
