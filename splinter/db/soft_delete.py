from django.db import models
from django.db.models.base import ModelBase
from django.utils import timezone


class SoftDeleteQuerySetMixin:
    def delete(self, force=False):
        if force:
            return super().delete()

        return True, self.update(removed_at=timezone.now())


class SoftDeleteManagerMixin:
    def get_queryset(self):
        return super().get_queryset().filter(removed_at__isnull=True)

    def deleted(self):
        return super().get_queryset().filter(removed_at__isnull=False)


class SoftDeleteModelBase(ModelBase):
    def add_to_class(cls, name, value):
        if name == 'objects':
            attrs = {}
            if value.auto_created:
                attrs['auto_created'] = value.auto_created

            manager_class = type('Manager', (SoftDeleteManagerMixin, type(value)), attrs)
            manager_class._queryset_class = type(
                'QuerySet',
                (SoftDeleteQuerySetMixin, value._queryset_class),  # NOQA
                {}
            )

            super().add_to_class(f'all_{name}', value)
            value = manager_class()

        super().add_to_class(name, value)


class SoftDeleteModel(models.Model, metaclass=SoftDeleteModelBase):
    removed_at = models.DateTimeField(null=True, blank=True, db_index=True, editable=False)

    def delete(self, **kwargs):
        if kwargs.pop('force', False):
            return super().delete(**kwargs)

        self.removed_at = timezone.now()
        self.save(update_fields=('removed_at', ))

    class Meta:
        abstract = True
