from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from splinter.apps.media.managers import MediaFileManager
from splinter.apps.media.storage import PrivateS3Boto3Storage
from splinter.db.models import PublicModel, SoftDeleteModel, TimestampedModel
from splinter.utils.django import PrimaryKeyField


def _upload_path(instance, filename):
    return f'uploads/{instance.alias}{_ext(filename)}'


def _ext(filename: str) -> str:
    idx = filename.rfind('.')
    return filename[idx:] if idx != -1 else ''


class MediaFile(TimestampedModel, SoftDeleteModel, PublicModel):
    file = models.FileField(storage=PrivateS3Boto3Storage(), upload_to=_upload_path)
    alias = models.CharField(max_length=32, unique=True)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=127)
    uploaded_by = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')
    processed = models.BooleanField(default=False)
    thumbnail_key = models.CharField(max_length=512, null=True, blank=True)
    metadata = models.JSONField(default=dict)

    content_type_fk = models.ForeignKey(ContentType, null=True, blank=True, on_delete=models.SET_NULL)
    object_id = PrimaryKeyField(null=True, blank=True)
    content_object = GenericForeignKey('content_type_fk', 'object_id')

    objects = MediaFileManager()

    class Meta:
        db_table = 'media_files'
        ordering = ('-created_at',)

    def __str__(self):
        return self.original_filename
