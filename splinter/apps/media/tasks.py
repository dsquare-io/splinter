import io
import logging
from datetime import datetime, timedelta, timezone

from celery import shared_task
from django.conf import settings
from django.utils import timezone as django_timezone

from splinter.apps.media.utils import _file_ext, s3_client

logger = logging.getLogger(__name__)


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
    registered_aliases = set(
        MediaFile.objects.include_deleted().values_list('alias', flat=True)
    )

    paginator = client.get_paginator('list_objects_v2')
    for page in paginator.paginate(Bucket=bucket, Prefix='uploads/'):
        for obj in page.get('Contents', []):
            if obj['LastModified'] >= cutoff:
                continue
            key = obj['Key']
            stem = key[len('uploads/'):].split('.')[0]
            if stem not in registered_aliases:
                try:
                    client.delete_object(Bucket=bucket, Key=key)
                except Exception:
                    logger.exception('Failed to delete orphan S3 key %s', key)


@shared_task
def process_media_file(media_file_pk):
    from splinter.apps.media.models import MediaFile

    try:
        media_file = MediaFile.objects.get(pk=media_file_pk)
    except MediaFile.DoesNotExist:
        return

    if media_file.processed or not media_file.object_id:
        return

    bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
    if not bucket:
        return

    client = s3_client()
    old_key = media_file.file.name
    now = django_timezone.now()

    ext = _file_ext(old_key)
    new_key = f'attachments/{now.year}/{now.month:02d}/{media_file.alias}{ext}'

    try:
        # Step 1: move uploads/ → attachments/
        client.copy_object(
            Bucket=bucket,
            CopySource={'Bucket': bucket, 'Key': old_key},
            Key=new_key,
        )
        client.delete_object(Bucket=bucket, Key=old_key)

        content_type = media_file.content_type
        active_key = new_key

        # Steps 2 & 3: image processing
        if content_type in ('image/jpeg', 'image/png', 'image/webp', 'image/heic'):
            from PIL import Image

            raw = client.get_object(Bucket=bucket, Key=new_key)['Body'].read()
            img = Image.open(io.BytesIO(raw)).convert('RGB')

            # Cap longer side at 2048px
            w, h = img.size
            if max(w, h) > 2048:
                if w >= h:
                    img = img.resize((2048, int(h * 2048 / w)), Image.LANCZOS)
                else:
                    img = img.resize((int(w * 2048 / h), 2048), Image.LANCZOS)

            if content_type == 'image/png':
                out_ext = '.webp'
                out_format = 'WEBP'
            elif content_type == 'image/webp':
                out_ext = ext
                out_format = 'WEBP'
            else:
                out_ext = ext
                out_format = 'JPEG'

            out_key = f'attachments/{now.year}/{now.month:02d}/{media_file.alias}{out_ext}'
            buf = io.BytesIO()
            img.save(buf, format=out_format, quality=85)
            buf.seek(0)
            client.put_object(Bucket=bucket, Key=out_key, Body=buf, ContentType=content_type)

            if out_key != new_key:
                client.delete_object(Bucket=bucket, Key=new_key)
            active_key = out_key

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

            thumb_key = f'attachments/{now.year}/{now.month:02d}/{media_file.alias}_thumb.jpg'
            thumb_buf = io.BytesIO()
            thumb.save(thumb_buf, format='JPEG', quality=85)
            thumb_buf.seek(0)
            client.put_object(Bucket=bucket, Key=thumb_key, Body=thumb_buf, ContentType='image/jpeg')
            media_file.thumbnail_key = thumb_key

        media_file.file.name = active_key
        media_file.processed = True
        media_file.save(update_fields=['file', 'thumbnail_key', 'processed'])

    except Exception:
        logger.exception('Failed to process MediaFile pk=%s', media_file_pk)
