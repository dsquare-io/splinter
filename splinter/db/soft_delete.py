from django.db import models
from django.db.models.manager import BaseManager
from django.utils import timezone


class SoftDeleteQuerySet(models.QuerySet):
    def delete(self, force=False):
        if force:
            return super().delete()

        return True, self.update(removed_at=timezone.now())


class SoftDeleteManager(BaseManager.from_queryset(SoftDeleteQuerySet)):
    def get_queryset(self):
        return super().get_queryset().filter(removed_at__isnull=True)


class SoftDeleteModel(models.Model):
    removed_at = models.DateTimeField(null=True, blank=True, db_index=True, editable=False)

    objects = SoftDeleteManager()

    def delete(self, **kwargs):
        if kwargs.pop('force', False):
            return super().delete(**kwargs)

        self.removed_at = timezone.now()
        self.save(update_fields=('removed_at', ))

    class Meta:
        abstract = True
