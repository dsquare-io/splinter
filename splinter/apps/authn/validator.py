from dataclasses import dataclass
from typing import TYPE_CHECKING

import jwt
from rest_framework.exceptions import APIException, AuthenticationFailed, ValidationError

from splinter.apps.authn import ACCESS_TOKEN_ALGORITHM, REFRESH_TOKEN_ALGORITHM
from splinter.apps.authn.models import UserSecret
from splinter.db.urn import ResourceName

if TYPE_CHECKING:
    from splinter.apps.user.models import User


@dataclass(slots=True, frozen=True)
class ValidatedToken:
    subject: 'User'
    subject_secret: UserSecret
    payload: dict


class TokenValidator:
    error_class: type[APIException]

    algorithm: str = 'ES256'
    kind: str | None = None

    def translate_jwt_error(self, ex: jwt.PyJWTError) -> APIException:
        if isinstance(ex, jwt.ExpiredSignatureError):
            return self.error_class(
                'Authentication token expired. Please refresh your token.',
                code='authn:token_expired',
            )

        if isinstance(ex, jwt.DecodeError):
            return self.error_class(f'Unable to decode JWT token. Reason: {ex}', code='authn:jwt_decode_error')

        return self.error_class(f'Invalid token: {ex}', code='authn:invalid_token')

    def validate_kind(self, token: str) -> None:
        if jwt.get_unverified_header(token).get('kid') != self.kind:
            raise self.error_class('Invalid token kind', code='authn:invalid_kind')

    def get_subject_secret(self, subject: str) -> UserSecret:
        if not subject:
            raise self.error_class('Subject not found in token payload', code='authn:no_subject')

        rn = ResourceName.parse(subject)
        if rn.app_label != 'user' or rn.model_name != 'user' or rn.uid is None:
            raise self.error_class('Invalid subject in token payload', code='authn:invalid_subject')

        filters = {
            'user__username': rn.uid,
            'user__is_active': True,
        }

        user_secret = UserSecret.objects.select_related('user').filter(**filters).first()
        if user_secret is None:
            raise self.error_class('Subject is inactive or never existed', code='authn:subject_not_found')

        return user_secret

    def validate(self, token: str) -> ValidatedToken:
        try:
            self.validate_kind(token)
            decoded_payload = jwt.decode(token, options={'verify_signature': False})
        except jwt.PyJWTError as ex:
            raise self.translate_jwt_error(ex)

        subject_secret = self.get_subject_secret(decoded_payload.get('sub'))

        try:
            decoded_payload = jwt.decode(token, subject_secret.private_key.decode(), algorithms=[self.algorithm])
        except jwt.PyJWTError as ex:
            raise self.translate_jwt_error(ex)

        if subject_secret.jti.decode() != decoded_payload['jti']:
            raise self.error_class('Token has been revoked', code='authn:token_revoked')

        return ValidatedToken(
            subject=subject_secret.user,
            subject_secret=subject_secret,
            payload=decoded_payload,
        )


class AccessTokenValidator(TokenValidator):
    algorithm = ACCESS_TOKEN_ALGORITHM
    error_class: type[APIException] = AuthenticationFailed


class RefreshTokenValidator(TokenValidator):
    kind = 'refresh'
    algorithm = REFRESH_TOKEN_ALGORITHM
    error_class: type[APIException] = ValidationError
