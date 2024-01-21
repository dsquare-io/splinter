from typing import TYPE_CHECKING, Union

from django.conf import settings
from django.db import models
from django.utils.module_loading import import_string

if TYPE_CHECKING:
    from django.http import HttpRequest
    from rest_framework.request import Request

DEFAULT_AUTO_FIELD = import_string(settings.DEFAULT_AUTO_FIELD)

for cls in DEFAULT_AUTO_FIELD.__mro__[1:]:
    if issubclass(cls, models.Field):
        PrimaryKeyField = cls
        break
else:
    raise RuntimeError('Unable to figure out default primary key')


def get_client_ip(request: Union['HttpRequest', 'Request']) -> str:
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')

    return ip
