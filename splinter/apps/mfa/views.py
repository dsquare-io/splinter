from collections import defaultdict

from django.db import transaction
from django.http import Http404
from django.utils.functional import cached_property
from django_otp import devices_for_user, user_has_device
from django_otp.plugins.otp_static.models import StaticDevice, StaticToken
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ValidationError
from rest_framework.fields import CharField, ListField
from rest_framework.permissions import IsAuthenticated
from rest_framework.serializers import ListSerializer

from splinter.apps.mfa import serializers
from splinter.apps.mfa.configurators import DeviceConfigurator, StaticDeviceConfigurator
from splinter.apps.mfa.serializers import EnableMfaDeviceRequestSerializer
from splinter.apps.token.serializers import AccessTokenSerializer
from splinter.core.views import APIView, DestroyAPIView, GenericAPIView


class MfaDeviceAPIView(APIView):
    permission_classes = (IsAuthenticated, )
    mfa_device_confirmed = True

    @cached_property
    def configurator(self) -> DeviceConfigurator:
        device = self.kwargs['device']
        try:
            return DeviceConfigurator.get(device)
        except KeyError:
            raise Http404()

    @cached_property
    def mfa_device(self):
        device_cls = self.configurator.device_cls
        device = device_cls.objects.devices_for_user(self.request.user, confirmed=self.mfa_device_confirmed).first()
        if device is None:
            raise ValidationError(
                f'Device {self.configurator.verbose_name} is either not enabled or not confirmed for MFA',
                code='mfa_device_invalid'
            )

        return device

    def user_devices_info(self):
        devices = devices_for_user(self.request.user, confirmed=True)
        authentication_methods = []
        configured_devices = []

        available_configurators = {
            configurator.device_cls: configurator
            for configurator in DeviceConfigurator.__all__.values()
        }

        for d in devices:
            if isinstance(d, StaticDevice):
                continue

            configurator = available_configurators.pop(d.__class__)
            authentication_methods.extend(configurator.authentication_methods(d))
            configured_devices.append({'id': d.id, 'type': configurator.slug, 'name': d.name})

        available_configurators.pop(StaticDevice, None)
        return {
            'available_devices': [{
                'type': configurator.slug,
                'name': configurator.verbose_name
            } for configurator in available_configurators.values()],
            'configured_devices': configured_devices,
            'authentication_methods': authentication_methods
        }


class ListMfaDeviceView(MfaDeviceAPIView):
    permission_classes = (IsAuthenticated, )

    @extend_schema(responses={200: serializers.UserDeviceInfoSerializer})
    def get(self, request):
        return self.user_devices_info()


class DestroyMfaDeviceView(DestroyAPIView, MfaDeviceAPIView):
    mfa_device_confirmed = None

    def get_object(self):
        return self.mfa_device

    @transaction.atomic()
    def perform_destroy(self, instance):
        instance.delete()
        devices_by_type = defaultdict(int)

        for device in devices_for_user(self.request.user):
            devices_by_type[type(device)] += 1

        static_devices = devices_by_type.pop(StaticDevice, 0)
        if static_devices and not devices_by_type:
            StaticDevice.objects.filter(user=self.request.user).delete()


class ChallengeMfaDeviceView(MfaDeviceAPIView):
    @extend_schema(responses={200: serializers.ChallengeMfaDeviceResponseSerializer}, request=None)
    def post(self, request, **kwargs):
        return {'message': self.mfa_device.generate_challenge()}


class VerifyMfaDeviceView(MfaDeviceAPIView):
    serializer_class = serializers.MfaTokenSerializer

    def post(self, request, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not self.mfa_device.verify_token(serializer.validated_data['token']):
            raise ValidationError('Failed to validate MFA token', code='mfa_device_token_invalid')

        self.request.auth.delete()  # Delete current access token
        access_token = self.request.user.access_tokens.create(owner=self.request.user)
        return AccessTokenSerializer(instance=access_token).data


class EnableMfaDeviceView(MfaDeviceAPIView, GenericAPIView):
    serializer_class = EnableMfaDeviceRequestSerializer

    @extend_schema(responses={200: serializers.EnableMfaDeviceResponseSerializer})
    def post(self, request, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        device = self.configurator.configure(request.user, params=serializer.validated_data['params'])
        return {'config_url': getattr(device, 'config_url', None)}


class ConfirmMfaDeviceView(MfaDeviceAPIView):
    serializer_class = serializers.MfaTokenSerializer
    mfa_device_confirmed = None

    def post(self, request, **kwargs):
        if self.mfa_device.confirmed:
            raise ValidationError('MFA device already confirmed.', code='mfa_device_already_confirmed')

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not self.mfa_device.verify_token(serializer.validated_data['token']):
            raise ValidationError('Failed to confirm token from MFA device', code='mfa_devive_invalid_token')

        self.mfa_device.confirmed = True
        self.mfa_device.save()
        return self.user_devices_info()


class ListMfaStaticCodeView(APIView):
    def check_permissions(self, request):
        if not user_has_device(request.user):
            self.permission_denied(request, 'MFA is not enabled. Backup codes cannot be generated.')

        super().check_permissions(request)

    @cached_property
    def mfa_device(self):
        return DeviceConfigurator.get('static').create_device(self.request.user)

    @extend_schema(responses={200: ListSerializer(child=CharField(max_length=8, min_length=8))})
    def get(self, request):
        return list(StaticToken.objects.filter(device=self.mfa_device).values_list('token', flat=True))

    @extend_schema(responses={200: ListSerializer(child=CharField(max_length=8, min_length=8))}, request=None)
    def post(self, request):
        StaticToken.objects.filter(device=self.mfa_device).delete()
        StaticDeviceConfigurator.generate_tokens(self.mfa_device)
        return self.get(request)
