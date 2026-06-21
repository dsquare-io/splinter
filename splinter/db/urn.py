import inspect
from collections import defaultdict
from dataclasses import dataclass
from functools import lru_cache
from typing import Collection, Optional, Protocol

from django.apps import apps
from django.core.exceptions import FieldDoesNotExist
from django.db.models import Model
from django.db.models.signals import class_prepared
from django.dispatch import receiver


class ResourceNameProtocol(Protocol):
    UID_FIELD: str

    urn: str
    uid: str | None


@dataclass(slots=True, frozen=True)
class ResourceName:
    app_label: str
    model_name: str
    uid: str | None = None

    def get_model_cls(self) -> type[ResourceNameProtocol] | type[Model]:
        return apps.get_model(self.app_label, self.model_name)

    def get_instance(self) -> Model | ResourceNameProtocol:
        model_cls = self.get_model_cls()
        return model_cls._base_manager.get(**{model_cls.UID_FIELD: self.uid})

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

    def __hash__(self):
        return hash((self.app_label, self.model_name, self.uid))

    @classmethod
    def try_parse(cls, resource_name: str | None) -> Optional['ResourceName']:
        if not resource_name:
            return None

        try:
            return cls.parse(resource_name)
        except ValueError:
            return None

    @classmethod
    def bulk_get_instance(
        cls, resource_names: Collection['ResourceName']
    ) -> dict['ResourceName', Model | ResourceNameProtocol]:
        instances: dict['ResourceName', Model | ResourceNameProtocol] = {}

        grouped_by_model: dict[type[Model], list[ResourceName]] = defaultdict(list)
        for resource_name in resource_names:
            grouped_by_model[resource_name.get_model_cls()].append(resource_name)

        for model_cls, names in grouped_by_model.items():
            rn_by_uid = {u.uid: u for u in names}
            for instance in model_cls._base_manager.filter(**{f'{model_cls.UID_FIELD}__in': list(rn_by_uid)}):
                instances[rn_by_uid[instance.uid]] = instance

        return instances


@lru_cache(maxsize=None)
def check_urn_support(model: Model | ResourceNameProtocol):
    model_name = f'{model._meta.app_label}.{model._meta.model_name}'.lower()

    if not hasattr(model, 'UID_FIELD'):
        raise NotImplementedError(f'URN is not supported for {model_name}. Reason: UID_FIELD is not defined')

    try:
        model._meta.get_field(model.UID_FIELD)
    except FieldDoesNotExist:
        raise NotImplementedError(
            f'URN is not supported for {model_name}. Reason: Specified UID_FIELD "{model.UID_FIELD}" does not exists'
        )


class UIDDecorator:
    def __get__(self, instance: Model | ResourceNameProtocol, owner) -> 'str | UIDDecorator | None':
        if instance is None:
            return self

        check_urn_support(type(instance))
        uid = getattr(instance, instance.UID_FIELD)
        if uid is not None and not isinstance(uid, str):
            uid = str(uid)

        return uid


class ResourceNameDecorator:
    def __get__(self, instance: Model | ResourceNameProtocol, owner) -> 'str | ResourceNameDecorator':
        if instance is None:
            return self

        uid = instance.uid
        app_label = instance._meta.app_label
        model_name = instance._meta.model_name
        name = ResourceName(app_label=app_label, model_name=model_name, uid=uid)
        return str(name)


@receiver(class_prepared)
def add_resource_name(sender, **kwargs):
    if inspect.isclass(sender) and issubclass(sender, Model):
        setattr(sender, 'uid', UIDDecorator())
        setattr(sender, 'urn', ResourceNameDecorator())
