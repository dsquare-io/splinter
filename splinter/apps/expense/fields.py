from drf_spectacular.extensions import OpenApiSerializerFieldExtension
from drf_spectacular.plumbing import build_object_type
from rest_framework.fields import DecimalField, DictField


class OutstandingBalanceSerializerField(DictField):
    child = DecimalField(max_digits=9, decimal_places=2)


class OutstandingBalanceSerializerFieldExtension(OpenApiSerializerFieldExtension):
    target_class = f'{OutstandingBalanceSerializerField.__module__}.{OutstandingBalanceSerializerField.__name__}'

    def map_serializer_field(self, auto_schema, direction):
        child_props = auto_schema._map_serializer_field(self.target.child, direction)  # NOQA

        return build_object_type(
            additionalProperties=child_props,
            example={'USD': '100.00'},
        )
