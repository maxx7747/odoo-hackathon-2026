from rest_framework import serializers
from .models import Notification, NotificationSetting


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "recipient", "type", "message", "channel", "is_read", "created_at"]
        read_only_fields = ["type", "message", "channel", "created_at"]


class NotificationSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSetting
        fields = ["id", "employee", "type", "in_app_enabled", "email_enabled"]
