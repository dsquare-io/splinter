from django.db.models import Manager, QuerySet

from splinter.db.soft_delete import SoftDeleteModel


class SoftDeleteModelWithDefaultManager(SoftDeleteModel):
    pass


class CustomSoftDeleteQuerySet(QuerySet):
    def custom_method(self):
        pass


class CustomSoftDeleteManager(Manager.from_queryset(CustomSoftDeleteQuerySet)):
    pass


class SoftDeleteModelWithCustomManager(SoftDeleteModel):
    objects = CustomSoftDeleteManager()
