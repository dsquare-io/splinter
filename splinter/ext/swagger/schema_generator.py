from typing import Any

from drf_yasg.generators import OpenAPISchemaGenerator
from drf_yasg.openapi import Schema

from splinter.utils.strings import underscore_to_camel


def _to_camel_case(obj):
    if not isinstance(obj, dict):
        return obj

    new_dict = {}
    for k, v in obj.items():
        new_dict[underscore_to_camel(k)] = to_camel_case(v)

    return new_dict


def to_camel_case(o: Any) -> Any:
    if isinstance(o, Schema):
        if 'properties' in o:
            o.properties = _to_camel_case(o.properties)

        if 'additional_properties' in o:
            o.additional_properties = _to_camel_case(o.additional_properties)

    return o


class OpenAPISchemaGeneratorEx(OpenAPISchemaGenerator):
    def get_schema(self, request=None, public=False):
        schema = super().get_schema(request=request, public=public)
        for name, definition in schema.definitions.items():
            schema.definitions[name] = to_camel_case(definition)

        return schema
