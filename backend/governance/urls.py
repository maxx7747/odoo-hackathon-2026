from rest_framework.routers import DefaultRouter
from .views import ESGPolicyViewSet, PolicyAcknowledgementViewSet, AuditViewSet, ComplianceIssueViewSet

router = DefaultRouter()
router.register("policies", ESGPolicyViewSet)
router.register("policy-acknowledgements", PolicyAcknowledgementViewSet)
router.register("audits", AuditViewSet)
router.register("compliance-issues", ComplianceIssueViewSet)

urlpatterns = router.urls
