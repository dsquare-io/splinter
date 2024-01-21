import binascii
import os

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils import timezone
from django.utils.functional import cached_property

from splinter.db.soft_delete import SoftDeleteModel
from splinter.utils.django import PrimaryKeyField


class AccessToken(SoftDeleteModel):
    ACCESS_TOKEN_BYTES = 16
    access_token = models.CharField(max_length=ACCESS_TOKEN_BYTES * 2, unique=True)

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    require_mfa = models.BooleanField(default=False)

    object_id = PrimaryKeyField()
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object = GenericForeignKey()

    expires_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'access_tokens'

    def generate_access_token(self):
        return binascii.hexlify(os.urandom(self.ACCESS_TOKEN_BYTES)).decode()

    def save(self, **kwargs):
        if not self.access_token:
            self.access_token = self.generate_access_token()

        super().save(**kwargs)

    @cached_property
    def is_expired(self):
        return self.expires_at and self.expires_at < timezone.now()
