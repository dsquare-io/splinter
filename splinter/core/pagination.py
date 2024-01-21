import urllib.parse

from rest_framework.pagination import LimitOffsetPagination as DrfLimitOffsetPagination
from rest_framework.pagination import PageNumberPagination as DrfPageNumberPagination
from rest_framework.response import Response


def strip_host(url: str) -> str:
    (scheme, netloc, path, query, fragment) = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit(('', '', path, query, fragment))


class PageNumberPagination(DrfPageNumberPagination):
    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'results': data
        })

    def get_paginated_response_schema(self, schema):
        response_schema = super().get_paginated_response_schema(schema)
        response_schema['properties']['total_pages'] = {
            'type': 'integer',
            'example': 123,
        }
        response_schema['properties'].pop('next')
        response_schema['properties'].pop('previous')
        return response_schema


class LimitOffsetPagination(DrfLimitOffsetPagination):
    def get_next_link(self):
        next_link = super().get_next_link()
        if next_link:
            next_link = strip_host(next_link)

        return next_link

    def get_previous_link(self):
        prev_link = super().get_previous_link()
        if prev_link:
            prev_link = strip_host(prev_link)

        return prev_link
