from rest_framework import serializers


class MfaTokenSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
