from typing import TYPE_CHECKING

from django.apps import apps
from django_otp import user_has_device

if TYPE_CHECKING:
    from splinter.apps.user.models import User

MFA_CONFIGURED = 'mfa' in apps.app_configs


def is_mfa_enabled_for_user(user: 'User') -> bool:
    return MFA_CONFIGURED and user_has_device(user)
