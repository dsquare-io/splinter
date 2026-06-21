from dataclasses import dataclass
from typing import TYPE_CHECKING

import jwt
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Model
from rest_framework.exceptions import APIException, AuthenticationFailed, ValidationError

from splinter.apps.authn import ACCESS_TOKEN_ALGORITHM, REFRESH_TOKEN_ALGORITHM
from splinter.apps.authn.models import GlobalKey, UserSecret
from splinter.apps.user.models import User

if TYPE_CHECKING:
    from cryptography.hazmat.primitives.asymmetric.ec import EllipticCurvePrivateKey


@dataclass(slots=True, frozen=True)
class ValidatedToken[T: Model]:
    subject: T
    token_identifier: str
    payload: dict


class TokenValidator[T: Model]:
    error_class: type[APIException] = AuthenticationFailed

    algorithm: str = 'ES256'
    subject_model: type[T]
    key_type: str

    def translate_jwt_error(self, ex: jwt.PyJWTError) -> APIException:
        if isinstance(ex, jwt.ExpiredSignatureError):
            return self.error_class(
                'Authentication token expired. Please refresh your token.',
                code='authn:token_expired',
            )

        if isinstance(ex, jwt.DecodeError):
            return self.error_class(f'Unable to decode JWT token. Reason: {ex}', code='authn:jwt_decode_error')

        return self.error_class(f'Invalid token: {ex}', code='authn:invalid_token')

    def get_signing_key(self, token: str):
        raise NotImplementedError()

    def validate_subject(self, subject: str) -> tuple[T, str]:
        raise NotImplementedError()

    def validate(self, token: str) -> ValidatedToken:
        try:
            signing_key = self.get_signing_key(token)
            decoded_payload = jwt.decode(token, options={'verify_signature': False})
        except jwt.PyJWTError as ex:
            raise self.translate_jwt_error(ex)

        try:
            subject, token_identifier = self.validate_subject(decoded_payload['sub'])
        except (ValueError, DjangoValidationError):
            raise self.error_class('Invalid subject', code='authn:invalid_subject')

        try:
            decoded_payload = jwt.decode(token, signing_key, algorithms=[self.algorithm])
        except jwt.PyJWTError as ex:
            raise self.translate_jwt_error(ex)

        if token_identifier != decoded_payload.get('jti'):
            raise self.error_class('Token has been revoked', code='authn:token_revoked')

        return ValidatedToken(
            subject=subject,
            token_identifier=token_identifier,
            payload=decoded_payload,
        )


class UserTokenValidator(TokenValidator[User]):
    def get_signing_key(self, token: str) -> 'EllipticCurvePrivateKey':
        kid = jwt.get_unverified_header(token).get('kid', '')
        prefix = f'{self.key_type}_v'

        if not kid.startswith(prefix):
            raise self.error_class('Invalid token kind', code='authn:invalid_kind')

        try:
            version = int(kid[len(prefix) :])
        except (ValueError, IndexError):
            raise self.error_class('Invalid token kind', code='authn:invalid_kind')

        global_key = GlobalKey.objects.filter(key_type=self.key_type, version=version).first()
        if global_key is None:
            raise self.error_class('Invalid token kind', code='authn:invalid_kind')

        return global_key.private_key.decode()

    def validate_subject(self, subject: str) -> tuple[User, str]:
        filters = {
            'user__username': subject,
            'user__is_active': True,
        }

        user_secret = UserSecret.objects.select_related('user').filter(**filters).first()
        if user_secret is None:
            raise self.error_class('Subject is inactive or never existed', code='authn:subject_not_found')

        return user_secret.user, user_secret.jti.decode()


class AccessTokenValidator(UserTokenValidator):
    key_type = GlobalKey.KEY_TYPE_ACCESS
    algorithm = ACCESS_TOKEN_ALGORITHM


class RefreshTokenValidator(UserTokenValidator):
    key_type = GlobalKey.KEY_TYPE_REFRESH
    algorithm = REFRESH_TOKEN_ALGORITHM
    error_class: type[APIException] = ValidationError
