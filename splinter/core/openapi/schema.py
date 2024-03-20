import itertools
import logging
from functools import cached_property

import uritemplate
from django.conf import settings
from drf_spectacular.openapi import AutoSchema as AutoSchemaBase
from rest_framework import serializers

from splinter.core.views import CreateAPIView, UpdateAPIView
from splinter.utils.strings import pascal_to_title, underscore_to_camel

logger = logging.getLogger(__name__)


def to_camel_case(d: dict) -> dict:
    return {underscore_to_camel(k): v for k, v in d.items()}


class ErrorSerializer(serializers.Serializer):
    message = serializers.CharField()
    code = serializers.CharField(help_text='Short code describing the error')


class NotFoundSerializer(serializers.Serializer):
    detail = serializers.CharField()


class AutoSchema(AutoSchemaBase):
    VERBS_BY_METHOD = {
        'GET': {'List', 'Retrieve'},
        'POST': {'Create'},
        'PUT': {'Update'},
        'PATCH': {'PartialUpdate'},
        'DELETE': {'Destroy'},
    }
    ALL_VERBS = set(itertools.chain.from_iterable(VERBS_BY_METHOD.values()))

    @cached_property
    def verbs_from_view(self) -> set[str]:
        view_class_name = type(self.view).__name__

        found_verbs = {verb for verb in self.ALL_VERBS if verb in view_class_name}

        if 'Update' in found_verbs:
            found_verbs.add('PartialUpdate')

        return found_verbs

    @cached_property
    def resource_name(self):
        view_name = type(self.view).__name__
        for verb in self.verbs_from_view:
            view_name = view_name.replace(verb, '')

        view_name = view_name.replace('View', '').replace('API', '')
        return view_name

    def suggest_verb_from_view(self) -> str:
        verbs = self.verbs_from_view.intersection(self.VERBS_BY_METHOD[self.method])

        selected_verb = ''
        if verbs:
            selected_verb = verbs.pop()

        if not selected_verb:
            if self.method == 'PUT':
                selected_verb = 'Update'
            elif self.method == 'PATCH':
                selected_verb = 'PartialUpdate'

        return selected_verb

    def get_request_serializer(self):
        if self.method != 'DELETE':
            return super().get_request_serializer()

    def _is_create_operation(self) -> bool:
        return isinstance(self.view, CreateAPIView) and self.method == 'POST'

    def _is_update_operation(self) -> bool:
        return isinstance(self.view, UpdateAPIView) and self.method in ('PUT', 'PATCH')

    def get_response_serializers(self):
        if self._is_create_operation():
            return getattr(self.view, 'create_response_serializer_class', None)

        if not self._is_update_operation():  # Update operations don't return a body
            return super().get_response_serializers()

    def _get_response_bodies(self, *args, **kwargs):
        bodies = super()._get_response_bodies(*args, **kwargs)
        if self._is_update_operation() and '200' in bodies:
            bodies['204'] = bodies.pop('200')

        if uritemplate.variables(self.path):
            bodies['404'] = self._get_response_for_code(NotFoundSerializer, '404')
            bodies['404']['description'] = 'Resource Not Found'

        if self.method in ('POST', 'PUT', 'PATCH'):
            bodies['400'] = {
                'description': 'Bad Request',
                'content': {
                    'application/json': {
                        'schema': {
                            'type': 'object',
                            'properties': {
                                settings.REST_FRAMEWORK['NON_FIELD_ERRORS_KEY']: {
                                    'required': False,
                                    'type': 'array',
                                    'items': {
                                        'type': 'string',
                                    },
                                    'description': 'List of non-field errors',
                                },
                            },
                            'additionalProperties': {
                                'type': 'array',
                                'items': {
                                    'type': 'string',
                                },
                            },
                        },
                    },
                },
            }

        return bodies

    def _map_basic_serializer(self, *args, **kwargs):
        mapped = super()._map_basic_serializer(*args, **kwargs)
        if 'properties' in mapped:
            mapped['properties'] = to_camel_case(mapped['properties'])

        return mapped

    def get_operation(self, *args, **kwargs):
        op = super().get_operation(*args, **kwargs)
        if not op:
            return op

        if 'security' in op:
            op['responses']['401'] = self._get_response_for_code(ErrorSerializer, '401')
            op['responses']['401']['description'] = 'Unauthorized'

            op['responses']['403'] = self._get_response_for_code(ErrorSerializer, '403')
            op['responses']['403']['description'] = 'Request Forbidden'

        return op

    def get_operation_id(self) -> str:
        return f'{self.suggest_verb_from_view()}{self.resource_name}'

    def get_summary(self) -> str | None:
        resource_name = self.resource_name
        operation_name = f'{self.suggest_verb_from_view()}{resource_name}'
        return pascal_to_title(operation_name)
