from rest_framework import serializers


class MfaTokenSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)


class AvailableDeviceSerializer(serializers.Serializer):
    type = serializers.CharField()
    name = serializers.CharField()


class DeviceSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    type = serializers.CharField(required=True)
    name = serializers.CharField(required=True)


class UserDeviceInfoSerializer(serializers.Serializer):
    available_devices = AvailableDeviceSerializer(many=True)
    configured_devices = DeviceSerializer(many=True)
    authentication_methods = DeviceSerializer(many=True)


class ChallengeMfaDeviceResponseSerializer(serializers.Serializer):
    message = serializers.CharField(allow_blank=True, allow_null=True)


class EnableMfaDeviceRequestSerializer(serializers.Serializer):
    params = serializers.DictField(allow_null=True, default=None)


class EnableMfaDeviceResponseSerializer(serializers.Serializer):
    config_url = serializers.URLField(allow_null=True, allow_blank=True)
