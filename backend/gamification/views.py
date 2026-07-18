from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.models import Employee
from .models import Badge, EmployeeBadge, Reward, RewardRedemption, Challenge, ChallengeParticipation
from .serializers import (
    BadgeSerializer, EmployeeBadgeSerializer, RewardSerializer, RewardRedemptionSerializer,
    ChallengeSerializer, ChallengeParticipationSerializer,
)
from .services import redeem_reward, RedemptionError


class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status"]


class EmployeeBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmployeeBadge.objects.select_related("employee", "badge").all()
    serializer_class = EmployeeBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["employee", "badge"]


class RewardViewSet(viewsets.ModelViewSet):
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status"]

    @action(detail=True, methods=["post"])
    def redeem(self, request, pk=None):
        reward = self.get_object()
        employee_id = request.data.get("employee")
        if not employee_id:
            return Response({"detail": "employee is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            employee = Employee.objects.get(pk=employee_id)
        except Employee.DoesNotExist:
            return Response({"detail": "Employee not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            redemption = redeem_reward(employee, reward)
        except RedemptionError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(RewardRedemptionSerializer(redemption).data, status=status.HTTP_201_CREATED)


class RewardRedemptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RewardRedemption.objects.select_related("employee", "reward").all()
    serializer_class = RewardRedemptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["employee", "reward", "status"]


class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "difficulty", "category"]


class ChallengeParticipationViewSet(viewsets.ModelViewSet):
    queryset = ChallengeParticipation.objects.select_related("employee", "challenge").all()
    serializer_class = ChallengeParticipationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["challenge", "employee", "approval"]
