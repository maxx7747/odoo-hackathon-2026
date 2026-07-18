from rest_framework.routers import DefaultRouter
from .views import (
    BadgeViewSet, EmployeeBadgeViewSet, RewardViewSet, RewardRedemptionViewSet,
    ChallengeViewSet, ChallengeParticipationViewSet,
)

router = DefaultRouter()
router.register("badges", BadgeViewSet)
router.register("employee-badges", EmployeeBadgeViewSet)
router.register("rewards", RewardViewSet)
router.register("redemptions", RewardRedemptionViewSet)
router.register("challenges", ChallengeViewSet)
router.register("challenge-participations", ChallengeParticipationViewSet)

urlpatterns = router.urls
