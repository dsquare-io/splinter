from typing import TYPE_CHECKING

from django.conf import settings
from django.utils import timezone

from splinter.apps.mfa import is_mfa_enabled

if TYPE_CHECKING:
    from splinter.apps.token.models import AccessToken
    from splinter.apps.user.models import User


def generate_user_access_token(user: 'User') -> 'AccessToken':
    kwargs = {}
    if is_mfa_enabled(user):
        kwargs['require_mfa'] = True
        kwargs['expires_at'] = timezone.now() + settings.MFA_ACCESS_TOKEN_EXPIRY
    else:
        kwargs['expires_at'] = timezone.now() + settings.ACCESS_TOKEN_EXPIRY

    return user.access_tokens.create(owner=user, **kwargs)
