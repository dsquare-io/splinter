import datetime
import decimal
import uuid
from typing import Any

import orjson
from django.utils import timezone
from rest_framework.renderers import BaseRenderer

from splinter.utils.strings import underscore_to_camel


def to_camel_case(data: Any):
    if isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            if not isinstance(key, str):
                key = str(key)

            new_key = underscore_to_camel(key)
            new_dict[new_key] = to_camel_case(value)
        return new_dict

    if isinstance(data, (str, int, float, bool)):
        return data

    if isinstance(data, (list, tuple)) or hasattr(data, '__iter__'):
        return [to_camel_case(item) for item in data]

    if isinstance(data, datetime.datetime):
        representation = data.isoformat()
        if representation.endswith('+00:00'):
            representation = representation[:-6] + 'Z'
        return representation

    if isinstance(data, datetime.date):
        return data.isoformat()

    if isinstance(data, datetime.time):
        if timezone.is_aware(data):
            raise ValueError('JSON cannot represent timezone-aware times.')
        return data.isoformat()

    if isinstance(data, datetime.timedelta):
        return data.total_seconds()

    if isinstance(data, decimal.Decimal):
        # Serializers will coerce decimals to strings by default.
        return float(data)

    if isinstance(data, uuid.UUID):
        return str(data)

    if hasattr(data, '__json__'):
        return to_camel_case(data.__json__())

    return data


class CamelCaseJSONRenderer(BaseRenderer):
    media_type = 'application/json'
    format = 'json'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        if data is None:
            return b''

        data = to_camel_case(data)
        return orjson.dumps(data)
