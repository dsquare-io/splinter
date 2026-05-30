from django.db import models

from splinter.db.models import PublicModel, TimestampedModel


class Intent(models.TextChoices):
    RECEIPT = 'receipt', 'Receipt'
    PAYMENT = 'payment', 'Payment'


class Status(models.TextChoices):
    PENDING = 'pending', 'Pending'
    PROCESSING = 'processing', 'Processing'
    DONE = 'done', 'Done'
    FAILED = 'failed', 'Failed'


class ImageParse(TimestampedModel, PublicModel):
    media_file = models.ForeignKey('media.MediaFile', on_delete=models.CASCADE, related_name='parses')
    intent = models.CharField(max_length=16, choices=Intent.choices)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    provider = models.CharField(max_length=128)
    extracted_data = models.JSONField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'image_parses'
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.intent} parse of {self.media_file_id} ({self.status})'
