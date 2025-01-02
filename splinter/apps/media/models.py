import mimetypes
import uuid
from pathlib import Path

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _

from splinter.db.models import PublicModel, SoftDeleteModel


def get_upload_path(instance, filename):
    """Generate a unique path for uploaded file."""
    ext = Path(filename).suffix
    return f'uploads/{instance.content_type.model}/{instance.public_id}{ext}'


def validate_file_size(value):
    """Validate file size is under max allowed size."""
    if value.size > settings.MAX_UPLOAD_SIZE:
        raise ValidationError(
            _('File too large. Size should not exceed %(max_size)s MB.') % {'max_size': settings.MAX_UPLOAD_SIZE / (1024 * 1024)}  
        )


def validate_image_extension(value):
    """Validate file has an allowed image extension."""
    ext = Path(value.name).suffix.lower()
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            _('Unsupported file extension. Allowed extensions are: %(valid_extensions)s') % {
                'valid_extensions': ', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)
            }
        )


class Media(PublicModel, SoftDeleteModel):
    """Model for handling uploaded media files with content type relations."""
    
    file = models.FileField(
        upload_to=get_upload_path,
        validators=[validate_file_size, validate_image_extension]
    )
    
    # Original filename
    original_filename = models.CharField(max_length=255)
    
    # File metadata
    file_size = models.PositiveIntegerField(editable=False)
    mime_type = models.CharField(max_length=255, editable=False)
    
    # Generic foreign key to associate media with any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.BigIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # When the media was uploaded
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)

    class Meta:
        db_table = 'media'
        verbose_name_plural = 'media'
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"{self.original_filename} ({self.mime_type})"

    def save(self, *args, **kwargs):
        if not self.pk:  # Only set these fields on creation
            self.original_filename = self.file.name
            self.file_size = self.file.size
            self.mime_type = (
                mimetypes.guess_type(self.file.name)[0] 
                or 'application/octet-stream'
            )
        super().save(*args, **kwargs)

    @property
    def url(self):
        return self.file.url if self.file else None