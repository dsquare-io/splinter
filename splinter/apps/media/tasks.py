import io
import logging
from datetime import datetime, timedelta, timezone

from botocore.exceptions import ClientError
from celery import shared_task
from django.conf import settings

from splinter.apps.media.utils import _file_ext, s3_client

logger = logging.getLogger(__name__)

PROCESSABLE_IMAGE_TYPES = ('image/jpeg', 'image/png', 'image/webp', 'image/heic')


@shared_task
def cleanup_orphan_media_files():
    from splinter.apps.media.models import MediaFile

    bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
    client = s3_client() if bucket else None

    # Stage 1: delete DB orphans + their S3 objects
    for orphan in MediaFile.objects.orphans():
        if client:
            for key in filter(None, [orphan.file.name if orphan.file else None, orphan.thumbnail_key]):
                try:
                    client.delete_object(Bucket=bucket, Key=key)
                except Exception:
                    logger.exception('Failed to delete S3 key %s for MediaFile %s', key, orphan.pk)
        orphan.delete(force=True)

    if not client:
        return

    # Stage 2: sweep uploads/ prefix for unregistered keys older than 24 h
    cutoff = datetime.now(tz=timezone.utc) - timedelta(hours=24)
    registered_aliases = set(MediaFile.objects.include_deleted().values_list('alias', flat=True))

    paginator = client.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket, Prefix='uploads/'):
        for obj in page.get('Contents', []):
            if obj['LastModified'] >= cutoff:
                continue
            key = obj['Key']
            stem = key[len('uploads/') :].split('.')[0]
            if stem not in registered_aliases:
                try:
                    client.delete_object(Bucket=bucket, Key=key)
                except Exception:
                    logger.exception('Failed to delete orphan S3 key %s', key)


def _read_s3(client, bucket, key):
    try:
        return client.get_object(Bucket=bucket, Key=key)['Body'].read()
    except ClientError as exc:
        if exc.response.get('Error', {}).get('Code') in ('NoSuchKey', 'NoSuchBucket', '404'):
            return None
        raise


def _delete_s3(client, bucket, key):
    try:
        client.delete_object(Bucket=bucket, Key=key)
    except ClientError:
        logger.exception('Failed to delete S3 key %s', key)


def _process_media_file(media_file):
    """Idempotent core: relocate the upload to its permanent ``attachments/`` key,
    resize + convert images and build a thumbnail.

    Safe to call repeatedly and regardless of whether the file is attached to an
    object yet. The destination key is derived deterministically from
    ``created_at`` (not the wall clock) so re-runs target the same key. Already
    processed files are a no-op.
    """
    if media_file.processed:
        return

    bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
    if not bucket:
        return

    client = s3_client()
    old_key = media_file.file.name
    ts = media_file.created_at
    ext = _file_ext(old_key)
    content_type = media_file.content_type

    prefix = f'attachments/{ts.year}/{ts.month:02d}/{media_file.alias}'
    new_key = f'{prefix}{ext}'

    if content_type in PROCESSABLE_IMAGE_TYPES:
        from PIL import Image

        if content_type == 'image/png':
            out_ext, out_format = '.webp', 'WEBP'
        elif content_type == 'image/webp':
            out_ext, out_format = ext, 'WEBP'
        else:
            out_ext, out_format = ext, 'JPEG'
        out_key = f'{prefix}{out_ext}'

        # Source bytes: prefer the upload; on a retry the upload may already be
        # gone, so fall back to the derived destination keys.
        raw = (
            _read_s3(client, bucket, old_key) or _read_s3(client, bucket, out_key) or _read_s3(client, bucket, new_key)
        )
        if raw is None:
            logger.error('No source bytes for MediaFile pk=%s (keys %s / %s)', media_file.pk, old_key, out_key)
            return

        img = Image.open(io.BytesIO(raw)).convert('RGB')

        # Cap longer side at 2048px
        w, h = img.size
        if max(w, h) > 2048:
            if w >= h:
                img = img.resize((2048, int(h * 2048 / w)), Image.LANCZOS)
            else:
                img = img.resize((int(w * 2048 / h), 2048), Image.LANCZOS)

        buf = io.BytesIO()
        img.save(buf, format=out_format, quality=85)
        buf.seek(0)
        client.put_object(Bucket=bucket, Key=out_key, Body=buf, ContentType=content_type)

        # Thumbnail: 200×200 square crop
        thumb = Image.open(io.BytesIO(raw)).convert('RGB')
        tw, th = thumb.size
        if tw > th:
            left = (tw - th) // 2
            thumb = thumb.crop((left, 0, left + th, th))
        elif th > tw:
            top = (th - tw) // 2
            thumb = thumb.crop((0, top, tw, top + tw))
        thumb = thumb.resize((200, 200), Image.LANCZOS)

        thumb_key = f'{prefix}_thumb.jpg'
        thumb_buf = io.BytesIO()
        thumb.save(thumb_buf, format='JPEG', quality=85)
        thumb_buf.seek(0)
        client.put_object(Bucket=bucket, Key=thumb_key, Body=thumb_buf, ContentType='image/jpeg')
        media_file.thumbnail_key = thumb_key

        active_key = out_key
        # best-effort cleanup of the original upload (idempotent — deleting a
        # missing key is a no-op in S3)
        if old_key != active_key:
            _delete_s3(client, bucket, old_key)
    else:
        # non-image (e.g. pdf): just relocate uploads/ -> attachments/
        active_key = new_key
        if old_key != new_key:
            try:
                client.copy_object(
                    Bucket=bucket,
                    CopySource={'Bucket': bucket, 'Key': old_key},
                    Key=new_key,
                )
                _delete_s3(client, bucket, old_key)
            except ClientError as exc:
                # tolerate an already-relocated upload
                if exc.response.get('Error', {}).get('Code') not in ('NoSuchKey', '404'):
                    raise
                if _read_s3(client, bucket, new_key) is None:
                    raise

    media_file.file.name = active_key
    media_file.processed = True
    media_file.save(update_fields=['file', 'thumbnail_key', 'processed'])


@shared_task
def process_media_file(media_file_pk):
    from splinter.apps.media.models import MediaFile

    try:
        media_file = MediaFile.objects.get(pk=media_file_pk)
    except MediaFile.DoesNotExist:
        return

    # Signal-triggered path only runs for attached files; the inline parse path
    # calls _process_media_file directly and bypasses this gate.
    if not media_file.object_id:
        return

    try:
        _process_media_file(media_file)
    except Exception:
        logger.exception('Failed to process MediaFile pk=%s', media_file_pk)
