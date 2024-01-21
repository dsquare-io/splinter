from typing import Dict, Type

from django.conf import settings
from django_otp.models import Device
from django_otp.plugins.otp_static.models import StaticDevice, StaticToken
from django_otp.plugins.otp_totp.models import TOTPDevice


class DeviceConfigurator:
    device_cls: Type[Device] = None

    slug: str = None
    verbose_name: str = None

    __all__: Dict[str, 'DeviceConfigurator'] = {}

    def configure(self, user, params=None):
        device = self.device_cls.objects.devices_for_user(user).first()
        if device is not None:
            return device

        return self.create_device(user, params=params)

    def create_device(self, user, params=None) -> Device:
        raise NotImplementedError()

    def authentication_methods(self, device: Device):
        raise NotImplementedError()

    @classmethod
    def register(cls, configurator: Type['DeviceConfigurator']) -> Type['DeviceConfigurator']:
        slug = configurator.device_cls.__name__.replace('Device', '').lower()
        configurator.slug = slug

        cls.__all__[slug] = configurator()
        return configurator

    @classmethod
    def get(cls, slug: str) -> 'DeviceConfigurator':
        return cls.__all__[slug]


@DeviceConfigurator.register
class TOTPDeviceConfigurator(DeviceConfigurator):
    device_cls = TOTPDevice
    verbose_name = 'Authenticator App'

    def create_device(self, user, params=None):
        return self.device_cls.objects.create(user=user, name=self.verbose_name, confirmed=False)

    def authentication_methods(self, device: Device):
        return [{'id': device.id, 'type': self.slug, 'name': self.verbose_name}]


@DeviceConfigurator.register
class StaticDeviceConfigurator(DeviceConfigurator):
    device_cls = StaticDevice
    verbose_name = 'Backup Codes'

    @staticmethod
    def generate_tokens(device: Device):
        StaticToken.objects.bulk_create([
            StaticToken(device=device, token=StaticToken.random_token())
            for _ in range(settings.MFA_BACKUP_CODES_COUNT)
        ])

    def create_device(self, user, params=None) -> Device:
        device, created = self.device_cls.objects.get_or_create(user=user, defaults={'name': self.verbose_name})
        if created:
            self.generate_tokens(device)

        return device

    def authentication_methods(self, device: Device):
        return [{'id': device.id, 'slug': self.slug, 'name': self.verbose_name}]
