from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, EmployeeViewSet, CategoryViewSet, SystemSettingsView, DashboardOverviewView

router = DefaultRouter()
router.register("departments", DepartmentViewSet)
router.register("employees", EmployeeViewSet)
router.register("categories", CategoryViewSet)

urlpatterns = router.urls + [
    path("settings/", SystemSettingsView.as_view(), name="system-settings"),
    path("dashboard-overview/", DashboardOverviewView.as_view(), name="dashboard-overview"),
]
