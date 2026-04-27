from dataclasses import dataclass
from typing import TYPE_CHECKING

import jwt
from rest_framework.exceptions import APIException, AuthenticationFailed, ValidationError

from splinter.apps.authn import ACCESS_TOKEN_ALGORITHM, REFRESH_TOKEN_ALGORITHM
from splinter.apps.authn.models import GlobalKey, UserSecret
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

    def get_signing_key(self, token: str) -> GlobalKey:
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

        return global_key

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
            signing_key = self.get_signing_key(token)
            decoded_payload = jwt.decode(token, options={'verify_signature': False})
        except jwt.PyJWTError as ex:
            raise self.translate_jwt_error(ex)

        subject_secret = self.get_subject_secret(decoded_payload.get('sub'))

        try:
            decoded_payload = jwt.decode(token, signing_key.private_key.decode(), algorithms=[self.algorithm])
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
    key_type = GlobalKey.KEY_TYPE_ACCESS
    algorithm = ACCESS_TOKEN_ALGORITHM
    error_class: type[APIException] = AuthenticationFailed


class RefreshTokenValidator(TokenValidator):
    key_type = GlobalKey.KEY_TYPE_REFRESH
    algorithm = REFRESH_TOKEN_ALGORITHM
    error_class: type[APIException] = ValidationError
