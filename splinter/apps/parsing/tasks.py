import io
import logging

from celery import shared_task
from django.conf import settings

from splinter.apps.media.tasks import _process_media_file
from splinter.apps.media.utils import s3_client
from splinter.apps.parsing.client import build_client
from splinter.apps.parsing.exceptions import ParseError, ParseTransientError
from splinter.apps.parsing.models import ImageParse, Status
from splinter.apps.parsing.parsers import INTENT_PARSERS

logger = logging.getLogger(__name__)

_PIL_FORMAT_TO_MIME = {
    'JPEG': 'image/jpeg',
    'WEBP': 'image/webp',
    'PNG': 'image/png',
    'GIF': 'image/gif',
}


@shared_task(bind=True, autoretry_for=(ParseTransientError,), max_retries=2, retry_backoff=True)
def parse_media_file(self, parse_pk):
    parse = ImageParse.objects.select_related('media_file').get(pk=parse_pk)
    parse.status = Status.PROCESSING
    parse.save(update_fields=['status', 'updated_at'])

    try:
        media_file = parse.media_file

        # Ensure the processed image exists, even for receipt-first uploads that
        # were never attached to an object (idempotent, bypasses object_id gate).
        _process_media_file(media_file)

        bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
        raw = s3_client().get_object(Bucket=bucket, Key=media_file.file.name)['Body'].read()

        # Derive the mime from the actual bytes — the stored content_type can
        # disagree with the processed file (e.g. png -> webp, heic -> jpeg).
        from PIL import Image as PILImage

        fmt = (PILImage.open(io.BytesIO(raw)).format or '').upper()
        mime = _PIL_FORMAT_TO_MIME.get(fmt)
        if mime is None:
            raise ParseError(f'Unsupported processed image format: {fmt!r}')

        client = build_client()
        if client is None:
            raise ParseError('Image parser is not configured')

        parser = INTENT_PARSERS[parse.intent](client)
        result = parser.parse(raw, mime)

        parse.extracted_data = result.model_dump(mode='json')
        parse.error = None
        parse.status = Status.DONE
        parse.save(update_fields=['extracted_data', 'error', 'status', 'updated_at'])
    except ParseTransientError as exc:
        if self.request.retries >= self.max_retries:
            parse.status = Status.FAILED
            parse.error = str(exc)
            parse.save(update_fields=['status', 'error', 'updated_at'])
        raise
    except Exception as exc:
        parse.status = Status.FAILED
        parse.error = str(exc)
        parse.save(update_fields=['status', 'error', 'updated_at'])
        logger.exception('parse_media_file failed for ImageParse pk=%s', parse_pk)
