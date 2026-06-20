import datetime
import os.path

from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from splinter.db.models import PublicModel, TimestampedModel


def _file_prefix(attachment: "AbstractAttachment"):
    dt = (attachment.created_at or timezone.now()).astimezone(datetime.UTC)
    return os.path.join(
        attachment._meta.db_table,
        str(dt.year),
        f"{dt.month:02d}-{dt.day:02d}",
        str(attachment.public_id),
    )


def _file_extension(attachment: "AbstractAttachment", filename: str) -> str:
    extensions = settings.ATTACHMENT_ALLOWED_CONTENT_TYPE_EXTENSIONS.get(attachment.content_type)
    if extensions:
        return extensions[0]

    return os.path.splitext(filename)[1]


def file_upload_path(instance: "AbstractAttachment", filename: str):
    extension = _file_extension(instance, filename)
    return f'{_file_prefix(instance)}{extension}'


def thumbnail_upload_path(instance: "AbstractAttachment", filename: str):
    extension = _file_extension(instance, filename)
    return f'{_file_prefix(instance)}-thumb{extension}'


def processed_file_upload_path(instance: "AbstractAttachment", filename: str):
    extension = _file_extension(instance, filename)
    return f'{_file_prefix(instance)}-processed{extension}'


class AbstractAttachment(PublicModel, TimestampedModel):
    file = models.FileField(upload_to=file_upload_path)
    processed_file = models.FileField(upload_to=processed_file_upload_path, null=True, blank=True)
    thumbnail = models.FileField(upload_to=thumbnail_upload_path, null=True, blank=True)

    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    content_type = models.CharField(max_length=128)

    created_by = models.ForeignKey('user.User', on_delete=models.CASCADE, related_name='+')
    is_processed = models.BooleanField(default=False)

    class Meta:
        abstract = True

    def __str__(self):
        return self.file_name

    def __public_str__(self) -> str:
        return self.file_name


class FileAttachment(AbstractAttachment):
    class Meta:
        db_table = 'attachments'


class Avatar(AbstractAttachment):
    class Meta:
        db_table = 'avatars'
