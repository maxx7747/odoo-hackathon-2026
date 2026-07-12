from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    CSRActivityViewSet,
    EmployeeParticipationViewSet,
    DiversityMetricViewSet,
    TrainingCompletionViewSet,
    DepartmentSocialScoreViewSet,
    generate_report,
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'csr-activities', CSRActivityViewSet)
router.register(r'employee-participation', EmployeeParticipationViewSet)
router.register(r'diversity-metrics', DiversityMetricViewSet)
router.register(r'training-completion', TrainingCompletionViewSet)
router.register(r'social-scores', DepartmentSocialScoreViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('reports/pdf/', generate_report, name='generate_report'),
]