from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    EmissionFactorViewSet, ProductESGProfileViewSet, EnvironmentalGoalViewSet,
    CarbonTransactionViewSet, AutoEmissionIngestView,
)

router = DefaultRouter()
router.register("emission-factors", EmissionFactorViewSet)
router.register("product-profiles", ProductESGProfileViewSet)
router.register("goals", EnvironmentalGoalViewSet)
router.register("carbon-transactions", CarbonTransactionViewSet)

urlpatterns = router.urls + [
    path("carbon-transactions/auto-ingest/", AutoEmissionIngestView.as_view(), name="auto-emission-ingest"),
]
