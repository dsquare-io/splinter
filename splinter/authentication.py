from typing import TYPE_CHECKING, Optional, Set, Tuple, Type

from django.db.models import Model
from django.http import HttpRequest
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from splinter.apps.authn.validator import AccessTokenValidator
from splinter.apps.user.models import User
from splinter.db.urn import ResourceName


class AccessTokenAuthenticationMeta(type):
    object_models: Set[Type[Model]]

    def __or__(self, other: Type['AccessTokenAuthenticationMeta']) -> Type['AccessTokenAuthenticationMeta']:
        if not isinstance(other, AccessTokenAuthenticationMeta):
            raise NotImplementedError()

        object_models = self.object_models | other.object_models
        auth = type('AccessTokenAuthentication', (BaseAccessTokenAuthentication, ), {'object_models': object_models})
        return auth


class BaseAccessTokenAuthentication(BaseAuthentication, metaclass=AccessTokenAuthenticationMeta):
    keyword = 'Bearer'

    if TYPE_CHECKING:
        object_models: Set[Type[Model]]

    def authenticate(self, request: HttpRequest) -> Optional[Tuple['User', None]]:
        auth = get_authorization_header(request).split()

        if not auth or auth[0].lower() != self.keyword.lower().encode():
            return

        if len(auth) == 1:
            raise AuthenticationFailed('Invalid token header. No credentials provided.', code='no_credentials')

        elif len(auth) > 2:
            raise AuthenticationFailed(
                'Invalid token header. Token string should not contain spaces.', code='invalid_auth_header'
            )

        try:
            token = auth[1].decode()
        except UnicodeError:
            raise AuthenticationFailed(
                'Invalid token header. Token string should not contain invalid characters.', code='invalid_auth_header'
            )

        return self.authenticate_credentials(token)

    def authenticate_credentials(self, access_token: str) -> Tuple['User', None]:
        token = AccessTokenValidator().validate(access_token)
        user = token.subject

        self.validate_audience(token.payload)
        user.require_mfa = token.payload.get('mfa', False)
        return user, None

    def validate_audience(self, token: dict) -> None:
        audience = token.get('aud')
        if audience is None:
            # if the token is for a user, it should have the user resource name as audience
            audience = ResourceName('user', 'user')

        if not isinstance(audience, list):
            audience = [audience]

        audience_models = set()
        for aud in audience:
            if isinstance(aud, str):
                aud = ResourceName.parse(aud)

            audience_models.add(aud.get_model())

        if not self.object_models.intersection(audience_models):
            raise AuthenticationFailed('Token not valid in current context', code='invalid_aud')

    def authenticate_header(self, request):
        return self.keyword


class UserAccessTokenAuthentication(BaseAccessTokenAuthentication):
    object_models = {User}
