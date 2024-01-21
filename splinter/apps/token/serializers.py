from rest_framework import serializers

from splinter.apps.token.models import AccessToken


class AccessTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessToken
        fields = ('access_token', 'require_mfa', 'expires_at', 'created_at')
