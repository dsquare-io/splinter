from drf_spectacular.extensions import OpenApiSerializerFieldExtension
from drf_spectacular.plumbing import build_basic_type
from drf_spectacular.types import OpenApiTypes
from rest_framework.relations import PrimaryKeyRelatedField

from splinter.apps.currency.models import Currency


class CurrencySerializerField(PrimaryKeyRelatedField):
    queryset = Currency.objects

    def __init__(self, **kwargs):
        kwargs.setdefault('help_text', 'ISO 4217 Currency Code')
        if kwargs.get('read_only', False):
            kwargs.setdefault('queryset', None)

        super().__init__(**kwargs)


class CurrencySerializerFieldExtension(OpenApiSerializerFieldExtension):
    target_class = f'{CurrencySerializerField.__module__}.{CurrencySerializerField.__name__}'

    def map_serializer_field(self, auto_schema, direction):
        return build_basic_type(OpenApiTypes.STR)
