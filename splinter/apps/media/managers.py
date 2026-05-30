from datetime import timedelta

from django.conf import settings
from django.db.models import Manager, Q
from django.utils import timezone


class MediaFileManager(Manager):
    def _cleanup_delta(self) -> timedelta:
        return getattr(settings, 'MEDIA_GARBAGE_COLLECTION_DELTA', timedelta(hours=1))

    def attachable(self):
        cutoff = timezone.now() - self._cleanup_delta()
        return self.filter(content_type_fk__isnull=True, created_at__gte=cutoff)

    def orphans(self):
        cutoff = timezone.now() - self._cleanup_delta()
        return self.filter(content_type_fk__isnull=True, created_at__lt=cutoff)
