from rest_framework.routers import DefaultRouter
from .views import (
    CSRActivityViewSet, EmployeeParticipationViewSet, DiversityMetricViewSet, TrainingCompletionViewSet,
)

router = DefaultRouter()
router.register("csr-activities", CSRActivityViewSet)
router.register("participations", EmployeeParticipationViewSet)
router.register("diversity-metrics", DiversityMetricViewSet)
router.register("training-completions", TrainingCompletionViewSet)

urlpatterns = router.urls
