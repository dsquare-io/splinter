import inspect
from dataclasses import dataclass
from functools import lru_cache
from typing import Optional, Protocol, Union

from django.apps import apps
from django.core.exceptions import FieldDoesNotExist
from django.db.models import Model
from django.db.models.signals import class_prepared
from django.dispatch import receiver


class ResourceNameProtocol(Protocol):
    UID_FIELD: str

    urn: str


@dataclass(slots=True, frozen=True)
class ResourceName:
    app_label: str
    model_name: str
    uid: Optional[str] = None

    def get_model(self) -> Union[ResourceNameProtocol, Model]:
        return apps.get_model(self.app_label, self.model_name)

    def __str__(self) -> str:
        s = f'urn:splinter:{self.app_label}'
        if self.app_label != self.model_name:
            s += f':{self.model_name}'

        if self.uid:
            s += f'/{self.uid}'

        return s

    @classmethod
    def parse(cls, resource_name: str) -> 'ResourceName':
        urn_parts = resource_name.lower().split(':')
        if len(urn_parts) > 4 or len(urn_parts) < 3:
            raise ValueError('Invalid resource name')

        if urn_parts[0] != 'urn' or urn_parts[1] != 'splinter':
            raise ValueError('Unsupported URN scheme')

        app_label = urn_parts[2]
        uid_parts = urn_parts[-1].split('/')
        if len(uid_parts) > 2:
            raise ValueError('Invalid resource name')

        model_name = uid_parts[0]
        uid = uid_parts[1] if len(uid_parts) == 2 else None

        if len(urn_parts) == 3:
            app_label = model_name

        return cls(app_label=app_label, model_name=model_name, uid=uid)


@lru_cache(maxsize=None)
def check_urn_support(model: Union[Model, ResourceNameProtocol]):
    model_name = f'{model._meta.app_label}.{model._meta.model_name}'.lower()

    if not hasattr(model, 'UID_FIELD'):
        raise NotImplementedError(f'URN is not supported for {model_name}. Reason: UID_FIELD is not defined')

    try:
        model._meta.get_field(model.UID_FIELD)
    except FieldDoesNotExist:
        raise NotImplementedError(
            f'URN is not supported for {model_name}. Reason: Specified UID_FIELD "{model.UID_FIELD}" does not exists'
        )


class ResourceNameDecorator:
    def __get__(self, instance: Union[Model, ResourceNameProtocol], owner) -> Union[str, 'ResourceNameDecorator']:
        check_urn_support(type(instance))
        if instance is None:
            return self

        uid = getattr(instance, instance.UID_FIELD)
        app_label = instance._meta.app_label
        model_name = instance._meta.model_name
        name = ResourceName(app_label=app_label, model_name=model_name, uid=uid)
        return str(name)


@receiver(class_prepared)
def add_resource_name(sender, **kwargs):
    if inspect.isclass(sender) and issubclass(sender, Model):
        setattr(sender, 'urn', ResourceNameDecorator())


def get_instance(resource_name: str) -> Union[Model, ResourceNameProtocol]:
    rn = ResourceName.parse(resource_name)

    model_class = apps.get_model(rn.app_label, rn.model_name)
    check_urn_support(model_class)
    return model_class.objects.get(**{model_class.UID_FIELD: rn.uid})
