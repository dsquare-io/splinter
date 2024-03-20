from django.utils import timezone

from splinter.apps.authn.models import UserSecret
from splinter.apps.authn.provider import AccessTokenProvider, MfaAccessTokenProvider
from splinter.apps.authn.utils import generate_jti
from splinter.apps.mfa import MFA_CONFIGURED
from splinter.apps.user.models import User

if MFA_CONFIGURED:

    def generate_user_access_token(user: User, require_mfa: bool = True) -> dict:
        return MfaAccessTokenProvider.for_user(user, require_mfa=require_mfa).generate()

else:

    def generate_user_access_token(user: User) -> dict:
        return AccessTokenProvider.for_user(user).generate()


def rotate_user_access_token(user: User) -> dict:
    UserSecret.objects.filter(user=user).update(jti=generate_jti(), updated_at=timezone.now())
    return generate_user_access_token(user, require_mfa=False)
