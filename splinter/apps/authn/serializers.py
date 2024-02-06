from django.contrib.auth import authenticate
from rest_framework import serializers

from splinter.apps.authn.validator import RefreshTokenValidator, ValidatedToken
from splinter.apps.mfa import MFA_CONFIGURED


class AuthTokenDataSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    expires_at = serializers.DateTimeField()

    if MFA_CONFIGURED:
        require_mfa = serializers.BooleanField()


class AccessTokenSerializer(serializers.Serializer):
    access_token = serializers.CharField()
    expires_at = serializers.DateTimeField()


class AuthenticateUserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=64, trim_whitespace=False, required=True, min_length=1)
    password = serializers.CharField(max_length=64, trim_whitespace=False, required=True, min_length=1)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        user = authenticate(username=username, password=password)

        # The authenticate call simply returns None for is_active=False
        # users. (Assuming the default ModelBackend authentication
        # backend.)
        if not user:
            msg = 'Invalid username or password.'
            raise serializers.ValidationError(msg, code='invalid_credentials')

        attrs['user'] = user
        return attrs


class RefreshAccessTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(required=True, min_length=1)

    @staticmethod
    def validate_refresh_token(value: str) -> ValidatedToken:
        return RefreshTokenValidator().validate(value)
