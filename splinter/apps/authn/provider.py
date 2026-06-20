import datetime
from functools import cached_property, lru_cache

import jwt
from django.conf import settings
from django.utils import timezone

from splinter.apps.authn import ACCESS_TOKEN_ALGORITHM, REFRESH_TOKEN_ALGORITHM
from splinter.apps.authn.models import GlobalKey, UserSecret
from splinter.apps.authn.validator import ValidatedToken
from splinter.apps.mfa import MFA_CONFIGURED, is_mfa_enabled_for_user
from splinter.apps.user.models import User


@lru_cache(maxsize=1)
def _get_current_access_key() -> GlobalKey:
    return GlobalKey.objects.get(key_type=GlobalKey.KEY_TYPE_ACCESS, version=settings.AUTHN_ACCESS_TOKEN_KEY_VERSION)


@lru_cache(maxsize=1)
def _get_current_refresh_key() -> GlobalKey:
    return GlobalKey.objects.get(key_type=GlobalKey.KEY_TYPE_REFRESH, version=settings.AUTHN_REFRESH_TOKEN_KEY_VERSION)


class AccessTokenProvider:
    def __init__(self, subject: 'User', token_identifier: str, access_key: GlobalKey, refresh_key: GlobalKey):
        self.subject = subject
        self.token_identifier = token_identifier
        self.access_key = access_key
        self.refresh_key = refresh_key

        self.access_token_expiry_delta = settings.ACCESS_TOKEN_EXPIRY

    def should_generate_refresh_token(self) -> bool:
        return settings.AUTHN_REFRESH_TOKEN_ENABLED

    @cached_property
    def access_token_expiry(self) -> datetime.datetime:
        return timezone.now() + self.access_token_expiry_delta

    def access_token_payload(self) -> dict:
        return {'jti': self.token_identifier, 'sub': self.subject.urn, 'exp': self.access_token_expiry}

    def refresh_token_payload(self) -> dict:
        return {
            'jti': self.token_identifier,
            'sub': self.subject.urn,
        }

    def generate_access_token(self) -> str:
        return jwt.encode(
            self.access_token_payload(),
            self.access_key.private_key.decode(),
            algorithm=ACCESS_TOKEN_ALGORITHM,
            headers={'kid': self.access_key.kid},
        )

    def generate_refresh_token(self) -> str:
        return jwt.encode(
            self.refresh_token_payload(),
            self.refresh_key.private_key.decode(),
            algorithm=REFRESH_TOKEN_ALGORITHM,
            headers={'kid': self.refresh_key.kid},
        )

    def generate(self) -> dict:
        info = {
            'access_token': self.generate_access_token(),
            'refresh_token': None,
            'expires_at': self.access_token_expiry,
        }

        if self.should_generate_refresh_token():
            info['refresh_token'] = self.generate_refresh_token()

        return info

    @classmethod
    def for_user[T](cls: type[T], user: User, **kwargs) -> T:
        user_secret, _ = UserSecret.objects.get_or_create(user=user)
        return cls(
            subject=user,
            token_identifier=user_secret.jti.decode(),
            access_key=_get_current_access_key(),
            refresh_key=_get_current_refresh_key(),
            **kwargs,
        )


class MfaAccessTokenProvider(AccessTokenProvider):
    def __init__(self, require_mfa: bool = MFA_CONFIGURED, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if require_mfa and not is_mfa_enabled_for_user(self.subject):
            require_mfa = False

        self.require_mfa = require_mfa
        if require_mfa:
            self.access_token_expiry_delta = settings.MFA_ACCESS_TOKEN_EXPIRY

    def should_generate_refresh_token(self) -> bool:
        return super().should_generate_refresh_token() and self.require_mfa

    def access_token_payload(self) -> dict:
        payload = super().access_token_payload()
        if self.require_mfa:
            payload['mfa'] = True

        return payload

    def generate(self) -> dict:
        info = super().generate()
        if self.require_mfa:
            info['require_mfa'] = True

        return info


class AccessTokenFromRefreshTokenProvider(AccessTokenProvider):
    def __init__(self, refresh_token: ValidatedToken):
        super().__init__(
            subject=refresh_token.subject,
            token_identifier=refresh_token.token_identifier,
            access_key=_get_current_access_key(),
            refresh_key=_get_current_refresh_key(),
        )

        self.refresh_token = refresh_token

    def access_token_payload(self) -> dict:
        payload = super().access_token_payload()
        payload.update(self.refresh_token.payload)
        return payload

    def generate(self) -> dict:
        return {
            'access_token': self.generate_access_token(),
            'expires_at': self.access_token_expiry,
        }
