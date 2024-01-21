from django.apps import apps
from django_otp import user_has_device


def is_mfa_enabled(user) -> bool:
    return 'mfa' in apps.app_configs and user_has_device(user)
