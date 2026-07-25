from typing import TYPE_CHECKING

from django.http import HttpRequest
from drf_spectacular.extensions import OpenApiAuthenticationExtension
from rest_framework.authentication import BaseAuthentication

from splinter.apps.attachment.token import AttachmentTokenValidator

if TYPE_CHECKING:
    from splinter.apps.attachment.models import FileAttachment


class AttachmentTokenAuthentication(BaseAuthentication):
    def authenticate(self, request: HttpRequest) -> tuple['FileAttachment', None] | None:
        token = request.GET.get('token')
        if not token:
            return None

        validated = AttachmentTokenValidator().validate(token)
        subject = validated.subject

        subject.is_authenticated = True
        return subject, None

    def authenticate_header(self, request: HttpRequest) -> str:
        return 'token'


class AttachmentTokenAuthenticationScheme(OpenApiAuthenticationExtension):
    name = 'tokenAuth'
    target_class = f'{__name__}.{AttachmentTokenAuthentication.__name__}'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'query',
            'name': 'token',
            'description': 'User access token',
        }
