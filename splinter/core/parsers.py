import gzip
from io import BytesIO
from typing import Any

import orjson
from rest_framework.exceptions import ParseError
from rest_framework.parsers import BaseParser

from splinter.core.instrument import sentry_instrument
from splinter.core.renderers import CamelCaseJSONRenderer
from splinter.utils.strings import camel_to_underscore


def to_snake_case(data: Any) -> Any:
    if isinstance(data, dict):
        return {camel_to_underscore(key): to_snake_case(value) for key, value in data.items()}

    if isinstance(data, (list, tuple)):
        return [to_snake_case(item) for item in data]

    return data


class CamelCaseJSONParser(BaseParser):
    media_type = 'application/json'
    renderer_class = CamelCaseJSONRenderer

    @staticmethod
    def get_content_encoding(parser_context):
        if not parser_context:
            return

        request = parser_context['request']
        return request.META.get('HTTP_CONTENT_ENCODING')

    @sentry_instrument
    def parse(self, stream, media_type=None, parser_context=None):
        encoding = self.get_content_encoding(parser_context)
        if encoding == 'gzip':
            stream = gzip.GzipFile(fileobj=stream)

        if isinstance(stream, BytesIO):
            content = stream.getvalue()
        else:
            content = stream.read()

        try:
            parsed_body = orjson.loads(content)
        except ValueError as exc:
            raise ParseError(f'JSON parse error - {str(exc)}')

        return to_snake_case(parsed_body)
