from drf_spectacular.utils import extend_schema

from splinter.apps.authn.provider import AccessTokenFromRefreshTokenProvider
from splinter.apps.authn.serializers import (
    AccessTokenSerializer,
    AuthenticateUserSerializer,
    AuthTokenDataSerializer,
    RefreshAccessTokenSerializer,
)
from splinter.apps.authn.shortcuts import generate_user_access_token
from splinter.apps.authn.validator import ValidatedToken
from splinter.core.views import GenericAPIView


class PasswordLoginView(GenericAPIView):
    serializer_class = AuthenticateUserSerializer
    permission_classes = ()
    authentication_classes = ()

    @extend_schema(responses={200: AuthTokenDataSerializer})
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        return generate_user_access_token(user)


class RefreshAccessTokenView(GenericAPIView):
    serializer_class = RefreshAccessTokenSerializer
    permission_classes = ()
    authentication_classes = ()

    @extend_schema(responses={200: AccessTokenSerializer})
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token: ValidatedToken = serializer.validated_data['refresh_token']
        return AccessTokenFromRefreshTokenProvider(token).generate()
