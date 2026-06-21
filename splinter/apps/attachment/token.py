import jwt
from django.conf import settings
from django.utils import timezone

from splinter.apps.attachment.models import FileAttachment
from splinter.apps.authn.validator import TokenValidator

ATTACHMENT_TOKEN_ALGORITHM = 'HS256'


def generate_attachment_token(attachment: FileAttachment) -> str:
    payload = {
        'sub': str(attachment.public_id),
        'exp': timezone.now() + settings.ATTACHMENT_TOKEN_EXPIRY,
    }
    return jwt.encode(payload, settings.ATTACHMENT_TOKEN_SECRET, algorithm=ATTACHMENT_TOKEN_ALGORITHM)


class AttachmentTokenValidator(TokenValidator[FileAttachment]):
    algorithm = ATTACHMENT_TOKEN_ALGORITHM
    subject_model = FileAttachment

    def get_signing_key(self, token: str) -> str:
        return settings.ATTACHMENT_TOKEN_SECRET

    def validate_subject(self, uid: str) -> tuple[FileAttachment, None]:
        attachment = FileAttachment.objects.filter(public_id=uid).first()
        if attachment is None:
            raise self.error_class('Attachment not found', code='authn:subject_not_found')

        return attachment, None
