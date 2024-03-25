from django.test import TestCase

from splinter.db.models.soft_delete import SoftDeleteManagerMixin
from tests._app.models import SoftDeleteModelWithCustomManager, SoftDeleteModelWithDefaultManager


class SoftDeleteModelTests(TestCase):
    available_apps = ('tests._app',)

    def test_soft_delete(self):
        objs = [SoftDeleteModelWithDefaultManager.objects.create() for _ in range(5)]
        objs[-1].delete()

        self.assertEqual(
            list(SoftDeleteModelWithDefaultManager.objects.deleted().values_list('pk', flat=True)), [objs[-1].pk]
        )
        self.assertEqual(
            list(SoftDeleteModelWithDefaultManager.objects.values_list('pk', flat=True)), [obj.pk for obj in objs[:-1]]
        )

    def test_default_manager(self):
        manager = SoftDeleteModelWithDefaultManager.objects
        self.assertIsInstance(manager, SoftDeleteManagerMixin)
        self.assertTrue(manager.auto_created)

    def test_custom_manager(self):
        manager = SoftDeleteModelWithCustomManager.objects
        self.assertIsInstance(manager, SoftDeleteManagerMixin)
        self.assertFalse(manager.auto_created)

    def test_custom_manager_attrs(self):
        manager = SoftDeleteModelWithCustomManager.objects
        self.assertTrue(hasattr(manager, 'custom_method'))
