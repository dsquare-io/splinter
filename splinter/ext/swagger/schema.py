from typing import Any

import uritemplate
from drf_yasg import openapi
from drf_yasg.generators import OpenAPISchemaGenerator
from drf_yasg.inspectors import SwaggerAutoSchema as SwaggerAutoSchemaBase
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


class SwaggerAutoSchema(SwaggerAutoSchemaBase):
    GENERIC_ERROR_RESPONSE = openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'detail': openapi.Schema(type=openapi.TYPE_STRING, example='Authentication credentials were not provided.')
        }
    )

    def get_response_serializers(self):
        serializers = super().get_response_serializers()
        security = self.get_security()
        if not security and not isinstance(security, list):
            serializers['401'] = self.GENERIC_ERROR_RESPONSE
            serializers['403'] = self.GENERIC_ERROR_RESPONSE

        if uritemplate.variables(self.path):
            serializers['404'] = self.GENERIC_ERROR_RESPONSE

        method = self.method.upper()
        if method in ('POST', 'PUT', 'PATCH'):
            error_type_schema = openapi.Schema(
                type=openapi.TYPE_ARRAY,
                items=openapi.Schema(type=openapi.TYPE_STRING, example="This field is Required")
            )

            bad_request_props = {
                'request':
                    openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Schema(
                            type=openapi.TYPE_STRING, example="Something went wrong while handling the request"
                        )
                    )
            }

            view_serializer = self.get_view_serializer()
            if view_serializer is not None:
                for k in view_serializer.fields:
                    bad_request_props[underscore_to_camel(k)] = error_type_schema

            serializers['400'] = openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties=bad_request_props,
            )

        return serializers
