from typing import TYPE_CHECKING

from django.http import HttpRequest
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
