import itertools
import logging
from functools import cached_property
from typing import Set

import uritemplate
from drf_spectacular.openapi import AutoSchema as AutoSchemaBase
from rest_framework import serializers

from splinter.core.views import CreateAPIView, UpdateAPIView
from splinter.utils.strings import pascal_to_slug, underscore_to_camel

logger = logging.getLogger(__name__)


def to_camel_case(d: dict) -> dict:
    return {underscore_to_camel(k): v for k, v in d.items()}


class UnauthorizedErrorSerializer(serializers.Serializer):
    detail = serializers.CharField()


class NotFoundErrorSerializer(serializers.Serializer):
    detail = serializers.CharField()


class AutoSchema(AutoSchemaBase):
    VERBS_BY_METHOD = {
        'GET': {'List', 'Retrieve'},
        'POST': {'Create', 'BulkCreate'},
        'PUT': {'Update'},
        'PATCH': {'PartialUpdate'},
        'DELETE': {'Destroy'},
    }
    ALL_VERBS = set(itertools.chain.from_iterable(VERBS_BY_METHOD.values()))

    @cached_property
    def verbs_from_view(self) -> Set[str]:
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
        if self.method == 'DELETE':
            return None

        return super().get_request_serializer()

    def _is_create_operation(self) -> bool:
        return isinstance(self.view, CreateAPIView) and self.method == 'POST'

    def _is_update_operation(self) -> bool:
        return isinstance(self.view, UpdateAPIView) and self.method in ('PUT', 'PATCH')

    def get_response_serializers(self):
        if self._is_create_operation() or self._is_update_operation():
            return None

        return super().get_response_serializers()

    def _get_response_bodies(self, *args, **kwargs):
        bodies = super()._get_response_bodies(*args, **kwargs)
        if self._is_update_operation() and '200' in bodies:
            bodies['204'] = bodies.pop('200')

        if uritemplate.variables(self.path):
            bodies['404'] = self._get_response_for_code(NotFoundErrorSerializer, '404')

        if self.method in ('POST', 'PUT', 'PATCH'):
            serializer = self.build_bad_request_serializer()
            if serializer:
                bodies['400'] = self._get_response_for_code(serializer, '400')

        return bodies

    def _map_basic_serializer(self, *args, **kwargs):
        mapped = super()._map_basic_serializer(*args, **kwargs)
        if 'properties' in mapped:
            mapped['properties'] = to_camel_case(mapped['properties'])

        return mapped

    def build_bad_request_serializer(self):
        fields = {}
        serializer = self.get_request_serializer()
        if serializer is not None:
            for field in getattr(serializer, '_declared_fields', []):
                fields[field] = serializers.ListField(child=serializers.CharField())

        if not fields:
            return None

        serializer_name = f'{self.suggest_verb_from_view()}{self.resource_name}BadRequestSerializer'
        return type(serializer_name, (serializers.Serializer, ), fields)

    def get_operation(self, *args, **kwargs):
        op = super().get_operation(*args, **kwargs)
        if not op:
            return op

        if 'security' in op:
            op['responses']['401'] = self._get_response_for_code(UnauthorizedErrorSerializer, '401')
            op['responses']['403'] = self._get_response_for_code(UnauthorizedErrorSerializer, '403')

        return op

    def get_operation_id(self) -> str:
        operation_name = f'{self.suggest_verb_from_view()}{self.resource_name}'
        return pascal_to_slug(operation_name)
