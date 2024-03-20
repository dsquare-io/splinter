import datetime
from functools import cached_property

import jwt
from cryptography.hazmat.primitives.asymmetric import ec
from django.conf import settings
from django.utils import timezone

from splinter.apps.authn import ACCESS_TOKEN_ALGORITHM, REFRESH_TOKEN_ALGORITHM
from splinter.apps.authn.models import UserSecret
from splinter.apps.authn.validator import ValidatedToken
from splinter.apps.mfa import MFA_CONFIGURED, is_mfa_enabled_for_user
from splinter.apps.user.models import User


class AccessTokenProvider:
    def __init__(self, subject: 'User', token_identifier: str, private_key: ec.EllipticCurvePrivateKey):
        self.subject = subject
        self.token_identifier = token_identifier
        self.private_key = private_key

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
            self.private_key,
            algorithm=ACCESS_TOKEN_ALGORITHM,
        )

    def generate_refresh_token(self) -> str:
        return jwt.encode(
            self.refresh_token_payload(),
            self.private_key,
            algorithm=REFRESH_TOKEN_ALGORITHM,
            headers={'kid': 'refresh'},
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
            private_key=user_secret.private_key.decode(),
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
            token_identifier=refresh_token.subject_secret.jti.decode(),
            private_key=refresh_token.subject_secret.private_key.decode(),
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
