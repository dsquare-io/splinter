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

    def test_include_deleted_via_manager(self):
        objs = [SoftDeleteModelWithDefaultManager.objects.create() for _ in range(3)]
        objs[-1].delete()

        pks = list(SoftDeleteModelWithDefaultManager.objects.include_deleted().values_list('pk', flat=True))
        self.assertEqual(sorted(pks), sorted([o.pk for o in objs]))

    def test_include_deleted_preserves_other_filters(self):
        objs = [SoftDeleteModelWithDefaultManager.objects.create() for _ in range(3)]
        objs[-1].delete()

        target_pks = [o.pk for o in objs[:2]]
        pks = list(
            SoftDeleteModelWithDefaultManager.objects.filter(pk__in=target_pks)
            .include_deleted()
            .values_list('pk', flat=True)
        )
        self.assertEqual(sorted(pks), sorted(target_pks))
