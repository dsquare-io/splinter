from drf_spectacular.contrib.rest_polymorphic import (
    PolymorphicSerializerExtension as PolymorphicSerializerExtensionBase,
)
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from drf_spectacular.plumbing import ResolvedComponent, is_patched_serializer

from splinter.core.serializers import PolymorphicSerializer


class UserAccessTokenAuthenticationScheme(OpenApiAuthenticationExtension):
    name = 'bearerAuth'
    target_class = 'splinter.authentication.UserAccessTokenAuthentication'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'http',
            'scheme': 'bearer',
            'description': 'User access token',
            'bearerFormat': 'JWT',
        }


class PolymorphicSerializerExtension(PolymorphicSerializerExtensionBase):
    target_class = f'{PolymorphicSerializer.__module__}.{PolymorphicSerializer.__name__}'

    def map_serializer(self, auto_schema, direction):
        sub_components = {}
        serializer: PolymorphicSerializer = self.target

        for discriminator, sub_serializer in serializer.serializer_mapping.items():
            sub_serializer.partial = serializer.partial
            component = auto_schema.resolve_serializer(sub_serializer, direction)
            if not component:
                # rebuild a virtual schema-less component to model empty serializers
                component = ResolvedComponent(
                    name=auto_schema._get_serializer_name(sub_serializer, direction),
                    type=ResolvedComponent.SCHEMA,
                    object='virtual',
                )
            typed_component = self.build_typed_component(
                auto_schema=auto_schema,
                component=component,
                resource_type_field_name=serializer.discriminator_field,
                patched=is_patched_serializer(sub_serializer, direction),
            )
            sub_components[discriminator] = typed_component.ref

        return {
            'oneOf': list(sub_components.values()),
            'discriminator': {
                'propertyName': serializer.discriminator_field,
                'mapping': {discriminator: ref['$ref'] for discriminator, ref in sub_components.items()},
            },
        }
