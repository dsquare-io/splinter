from typing import TYPE_CHECKING, Optional, Tuple, Type

from django.contrib.contenttypes.models import ContentType
from django.db.models import Model
from django.http import HttpRequest
from django.utils import timezone
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from splinter.apps.token.models import AccessToken
from splinter.apps.user.models import User


class AccessTokenAuthenticationMeta(type):
    object_models: Tuple[Type[Model], ...]

    def __or__(self, other: Type['AccessTokenAuthenticationMeta']) -> Type['AccessTokenAuthenticationMeta']:
        if not isinstance(other, AccessTokenAuthenticationMeta):
            raise NotImplementedError()

        object_models = self.object_models + other.object_models
        auth = type('AccessTokenAuthentication', (BaseAccessTokenAuthentication, ), {'object_models': object_models})
        return auth


class BaseAccessTokenAuthentication(BaseAuthentication, metaclass=AccessTokenAuthenticationMeta):
    keyword = 'Bearer'

    if TYPE_CHECKING:
        object_models: Tuple[Type[Model], ...]

    def authenticate(self, request: HttpRequest) -> Optional[Tuple['User', 'AccessToken']]:
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

    def authenticate_credentials(self, access_token: str) -> Tuple['User', 'AccessToken']:
        try:
            token = AccessToken.objects.select_related('owner').get(access_token=access_token)
        except AccessToken.DoesNotExist:
            raise AuthenticationFailed('Invalid token.', code='invalid_token')

        if token.is_expired:
            raise AuthenticationFailed('Authentication token expired. Please refresh your token.', code='token_expired')

        if not self.is_valid_context(token):
            raise AuthenticationFailed('Provided token is not valid in current context', code='unauthorized_token')

        token.last_accessed_at = timezone.now()
        token.save(update_fields=['last_accessed_at'])

        owner = token.owner
        if not owner.is_active:
            raise AuthenticationFailed('User inactive or deleted.', code='inactive_user')

        owner.require_mfa = token.require_mfa
        return owner, token

    def is_valid_context(self, token: AccessToken) -> bool:
        for object_model in self.object_models:
            content_type = ContentType.objects.get_for_model(object_model)
            if token.content_type_id == content_type.id:
                return True

        return False

    def authenticate_header(self, request):
        return self.keyword


class UserAccessTokenAuthentication(BaseAccessTokenAuthentication):
    object_models = (User, )
