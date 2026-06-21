import logging

from celery import shared_task
from django.core.files.base import ContentFile
from django.db.models.signals import post_save
from django.dispatch import receiver

from splinter.apps.attachment.image import generate_thumbnail, resize_for_storage
from splinter.apps.attachment.models import FileAttachment

logger = logging.getLogger(__name__)


@shared_task
def process_file_attachment(pk):
    try:
        attachment = FileAttachment.objects.get(pk=pk)
    except FileAttachment.DoesNotExist:
        return

    if attachment.is_processed or not attachment.content_type.startswith('image/'):
        return

    try:
        original_image = attachment.file.open('rb').read()
        img, webp_bytes = resize_for_storage(original_image)
        attachment.processed_file.save('file.webp', ContentFile(webp_bytes), save=False)

        thumbnail = generate_thumbnail(img)
        attachment.thumbnail.save('thumb.webp', ContentFile(thumbnail), save=False)
    except Exception:
        logger.exception('Failed to process FileAttachment pk=%s', pk)
        return

    attachment.is_processed = True
    attachment.save(update_fields=['processed_file', 'thumbnail', 'is_processed'])


@receiver(post_save, sender=FileAttachment)
def _trigger_post_processing(instance: FileAttachment, created, **kwargs):
    if created:
        process_file_attachment.delay(instance.pk)
