from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import DepartmentScoreViewSet, OrganizationScoreViewSet, RecalculateScoresView

router = DefaultRouter()
router.register("department-scores", DepartmentScoreViewSet)
router.register("organization-scores", OrganizationScoreViewSet)

urlpatterns = router.urls + [
    path("recalculate/", RecalculateScoresView.as_view(), name="recalculate-scores"),
]
