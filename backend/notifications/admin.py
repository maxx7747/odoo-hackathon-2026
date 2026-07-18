from django.contrib import admin
from .models import Notification, NotificationSetting


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["recipient", "type", "channel", "is_read", "created_at"]
    list_filter = ["type", "channel", "is_read"]


@admin.register(NotificationSetting)
class NotificationSettingAdmin(admin.ModelAdmin):
    list_display = ["employee", "type", "in_app_enabled", "email_enabled"]
    list_filter = ["type"]
