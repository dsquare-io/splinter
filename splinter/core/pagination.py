import urllib.parse

from rest_framework.pagination import LimitOffsetPagination as DrfLimitOffsetPagination


def strip_host(url: str) -> str:
    (scheme, netloc, path, query, fragment) = urllib.parse.urlsplit(url)
    return urllib.parse.urlunsplit(('', '', path, query, fragment))


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

    def get_schema_operation_parameters(self, view):
        parameters = super().get_schema_operation_parameters(view)

        for parameter in parameters:
            if parameter['name'] == 'limit':
                parameter['schema']['default'] = self.default_limit
            elif parameter['name'] == 'offset':
                parameter['schema']['default'] = 0

        return parameters
