from django.db import models, router
from django.db.models.base import ModelBase
from django.db.models.signals import post_delete, pre_delete
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
            if getattr(value, 'use_in_migrations', False):
                if not isinstance(value, SoftDeleteManagerMixin):
                    raise TypeError(
                        'SoftDeleteModel Manager having use_in_migrations=True should inherit SoftDeleteManagerMixin'
                    )
            else:
                attrs = {}
                if value.auto_created:
                    attrs['auto_created'] = value.auto_created

                value = type('Manager', (SoftDeleteManagerMixin, type(value)), attrs)()

            if not isinstance(value._queryset_class, SoftDeleteQuerySetMixin):
                value._queryset_class = type('QuerySet', (SoftDeleteQuerySetMixin, value._queryset_class), {})  # NOQA

        super().add_to_class(name, value)


class SoftDeleteModel(models.Model, metaclass=SoftDeleteModelBase):
    removed_at = models.DateTimeField(null=True, blank=True, db_index=True, editable=False)

    def delete(self, using=None, **kwargs):
        if kwargs.pop('force', False):
            return super().delete(**kwargs)

        using = using or router.db_for_write(self.__class__, instance=self)

        pre_delete.send(sender=self.__class__, instance=self, using=using, origin=None)

        self.removed_at = timezone.now()
        self.__class__.objects.using(using).filter(pk=self.pk).update(removed_at=self.removed_at)  # Skip *_save signals

        post_delete.send(sender=self.__class__, instance=self, using=using, origin=None)

    class Meta:
        abstract = True
