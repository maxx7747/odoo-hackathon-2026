from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, NotificationSetting
from .serializers import NotificationSerializer, NotificationSettingSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.select_related("recipient").all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["recipient", "type", "is_read"]

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notif).data)


class NotificationSettingViewSet(viewsets.ModelViewSet):
    queryset = NotificationSetting.objects.select_related("employee").all()
    serializer_class = NotificationSettingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["employee", "type"]
