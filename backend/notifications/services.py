from .models import Notification, NotificationSetting


def notify(employee, notif_type, message):
    """
    Create a Notification for `employee` unless they've disabled this type entirely
    in their NotificationSetting. Determines channel from their per-type preference.
    """
    if employee is None:
        return None

    setting = NotificationSetting.objects.filter(employee=employee, type=notif_type).first()
    in_app = setting.in_app_enabled if setting else True
    email = setting.email_enabled if setting else True

    if not in_app and not email:
        return None

    channel = "both" if (in_app and email) else ("in_app" if in_app else "email")

    return Notification.objects.create(
        recipient=employee,
        type=notif_type,
        message=message,
        channel=channel,
    )
