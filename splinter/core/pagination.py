import urllib.parse

from django.utils.encoding import force_str
from rest_framework.pagination import CursorPagination as DrfCursorPagination
from rest_framework.response import Response


class CursorPagination(DrfCursorPagination):
    def _extract_cursor(self, link):
        if not link:
            return None
        params = urllib.parse.parse_qs(urllib.parse.urlsplit(link).query)
        values = params.get(self.cursor_query_param, None)
        return values[0] if values else None

    def get_paginated_response(self, data):
        return Response(
            {
                'nextCursor': self._extract_cursor(self.get_next_link()),
                'previousCursor': self._extract_cursor(self.get_previous_link()),
                'results': data,
            }
        )

    def get_paginated_response_schema(self, schema):
        return {
            'type': 'object',
            'required': ['results'],
            'properties': {
                'nextCursor': {'type': 'string', 'nullable': True},
                'previousCursor': {'type': 'string', 'nullable': True},
                'results': schema,
            },
        }

    def get_ordering(self, request, queryset, view):
        if hasattr(view, 'get_ordering'):
            return view.get_ordering(request)
        return super().get_ordering(request, queryset, view)

    def get_schema_operation_parameters(self, view):
        parameters = [
            {
                'name': self.cursor_query_param,
                'required': False,
                'in': 'query',
                'description': force_str(self.cursor_query_description),
                'schema': {
                    'type': 'string',
                },
            },
        ]
        return parameters
