from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, NotificationSettingViewSet

router = DefaultRouter()
router.register("notifications", NotificationViewSet)
router.register("notification-settings", NotificationSettingViewSet)

urlpatterns = router.urls
