from functools import lru_cache

import jwt
from django.conf import settings
from django.utils import timezone

from splinter.apps.attachment.models import FileAttachment
from splinter.apps.authn import ACCESS_TOKEN_ALGORITHM
from splinter.apps.authn.models import GlobalKey
from splinter.apps.authn.validator import TokenValidator


@lru_cache(maxsize=1)
def _get_current_attachment_key() -> GlobalKey:
    return GlobalKey.objects.get(
        key_type=GlobalKey.KEY_TYPE_ATTACHMENT,
        version=settings.AUTHN_ATTACHMENT_TOKEN_KEY_VERSION,
    )


def generate_attachment_token(attachment: FileAttachment) -> str:
    key = _get_current_attachment_key()
    payload = {
        'sub': attachment.urn,
        'jti': str(attachment.public_id),
        'exp': timezone.now() + settings.ATTACHMENT_TOKEN_EXPIRY,
    }

    return jwt.encode(
        payload,
        key.private_key.decode(),
        algorithm=ACCESS_TOKEN_ALGORITHM,
        headers={'kid': key.kid},
    )


class AttachmentTokenValidator(TokenValidator[FileAttachment]):
    key_type = GlobalKey.KEY_TYPE_ATTACHMENT
    algorithm = ACCESS_TOKEN_ALGORITHM
    subject_model = FileAttachment

    def validate_subject(self, uid: str) -> tuple[FileAttachment, str]:
        attachment = FileAttachment.objects.get(public_id=uid)
        if attachment is None:
            raise self.error_class('Attachment not found', code='authn:subject_not_found')

        return attachment, str(attachment.public_id)
