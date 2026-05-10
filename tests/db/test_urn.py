from unittest.mock import MagicMock, PropertyMock

from django.core.exceptions import FieldDoesNotExist
from django.test import TestCase
from parameterized import parameterized

from splinter.db.urn import ResourceName, ResourceNameDecorator, check_urn_support
from tests._app.models.urn import UrnSupportedModel


class ResourceNameParseTests(TestCase):
    @parameterized.expand(
        [
            ('urn:splinter:expense', 'expense', 'expense', None),
            ('urn:splinter:expense/1', 'expense', 'expense', '1'),
            ('urn:splinter:expense:party', 'expense', 'party', None),
            ('urn:splinter:expense:party/1', 'expense', 'party', '1'),
        ]
    )
    def test_parse_valid(self, urn, expected_app_label, expected_model_name, expected_uid):
        rn = ResourceName.parse(urn)
        self.assertEqual(rn.app_label, expected_app_label)
        self.assertEqual(rn.model_name, expected_model_name)
        self.assertEqual(rn.uid, expected_uid)

    @parameterized.expand(
        [
            ('too_few_parts', 'urn:splinter'),
            ('too_many_parts', 'urn:splinter:expense:party:extra'),
            ('wrong_scheme_prefix', 'uri:splinter:expense'),
            ('wrong_namespace', 'urn:other:expense'),
            ('too_many_uid_segments', 'urn:splinter:expense:party/1/2'),
        ]
    )
    def test_parse_invalid_raises(self, _name, urn):
        with self.assertRaises(ValueError):
            ResourceName.parse(urn)

    def test_parse_uppercase_normalized(self):
        rn = ResourceName.parse('URN:SPLINTER:EXPENSE:PARTY/ABC')
        self.assertEqual(rn.app_label, 'expense')
        self.assertEqual(rn.model_name, 'party')
        self.assertEqual(rn.uid, 'abc')


class ResourceNameTryParseTests(TestCase):
    def test_try_parse_none_returns_none(self):
        self.assertIsNone(ResourceName.try_parse(None))

    def test_try_parse_empty_string_returns_none(self):
        self.assertIsNone(ResourceName.try_parse(''))

    def test_try_parse_invalid_returns_none(self):
        self.assertIsNone(ResourceName.try_parse('not-a-urn'))

    def test_try_parse_valid_returns_resource_name(self):
        rn = ResourceName.try_parse('urn:splinter:expense:party/42')
        self.assertIsNotNone(rn)
        self.assertEqual(rn.uid, '42')


class ResourceNameStrTests(TestCase):
    @parameterized.expand(
        [
            ('same_app_model_no_uid', 'expense', 'expense', None, 'urn:splinter:expense'),
            ('same_app_model_with_uid', 'expense', 'expense', '1', 'urn:splinter:expense/1'),
            ('diff_app_model_no_uid', 'expense', 'party', None, 'urn:splinter:expense:party'),
            ('diff_app_model_with_uid', 'expense', 'party', '1', 'urn:splinter:expense:party/1'),
        ]
    )
    def test_str(self, _name, app_label, model_name, uid, expected):
        rn = ResourceName(app_label=app_label, model_name=model_name, uid=uid)
        self.assertEqual(str(rn), expected)

    def test_str_parse_roundtrip(self):
        original = ResourceName(app_label='expense', model_name='party', uid='abc123')
        parsed = ResourceName.parse(str(original))
        self.assertEqual(parsed.app_label, original.app_label)
        self.assertEqual(parsed.model_name, original.model_name)
        self.assertEqual(parsed.uid, original.uid)


class ResourceNameHashTests(TestCase):
    def test_equal_instances_same_hash(self):
        a = ResourceName(app_label='expense', model_name='party', uid='1')
        b = ResourceName(app_label='expense', model_name='party', uid='1')
        self.assertEqual(hash(a), hash(b))

    def test_different_uid_different_hash(self):
        a = ResourceName(app_label='expense', model_name='party', uid='1')
        b = ResourceName(app_label='expense', model_name='party', uid='2')
        self.assertNotEqual(hash(a), hash(b))

    def test_usable_as_dict_key(self):
        rn = ResourceName(app_label='expense', model_name='party', uid='1')
        d = {rn: 'value'}
        self.assertEqual(d[rn], 'value')


class CheckUrnSupportTests(TestCase):
    def _make_model(self, uid_field=None, field_exists=True):
        model = MagicMock()
        type(model)._meta = PropertyMock(return_value=MagicMock(app_label='test', model_name='mock'))

        if uid_field is None:
            del model.UID_FIELD
            type(model).UID_FIELD = PropertyMock(side_effect=AttributeError)
        else:
            model.UID_FIELD = uid_field
            if field_exists:
                model._meta.get_field.return_value = MagicMock()
            else:
                model._meta.get_field.side_effect = FieldDoesNotExist()

        return model

    def test_no_uid_field_raises(self):
        model = MagicMock(spec=[])
        type(model)._meta = PropertyMock(return_value=MagicMock(app_label='test', model_name='mock'))
        with self.assertRaises(NotImplementedError):
            check_urn_support(model)

    def test_nonexistent_uid_field_raises(self):
        model = MagicMock()
        model.UID_FIELD = 'nonexistent'
        model._meta.app_label = 'test'
        model._meta.model_name = 'mock'
        model._meta.get_field.side_effect = FieldDoesNotExist()
        with self.assertRaises(NotImplementedError):
            check_urn_support(model)

    def test_valid_model_passes(self):
        check_urn_support(UrnSupportedModel)


class ResourceNameDecoratorTests(TestCase):
    available_apps = ('tests._app',)

    def test_instance_returns_urn_string(self):
        obj = UrnSupportedModel(uid='abc-123')
        self.assertEqual(obj.urn, 'urn:splinter:splinter_tests:urnsupportedmodel/abc-123')

    def test_urn_reflects_uid_value(self):
        obj1 = UrnSupportedModel(uid='uid-1')
        obj2 = UrnSupportedModel(uid='uid-2')
        self.assertNotEqual(obj1.urn, obj2.urn)


class ResourceNameGetInstanceTests(TestCase):
    available_apps = ('tests._app',)

    def test_get_instance(self):
        obj = UrnSupportedModel.objects.create(uid='test-uid-get')
        rn = ResourceName.parse(obj.urn)
        fetched = rn.get_instance()
        self.assertEqual(fetched.pk, obj.pk)

    def test_get_instance_not_found_raises(self):
        from django.core.exceptions import ObjectDoesNotExist

        rn = ResourceName(app_label='splinter_tests', model_name='urnsupportedmodel', uid='nonexistent')
        with self.assertRaises(ObjectDoesNotExist):
            rn.get_instance()


class ResourceNameBulkGetInstanceTests(TestCase):
    available_apps = ('tests._app',)

    def test_bulk_get_instance(self):
        objs = [UrnSupportedModel.objects.create(uid=f'bulk-uid-{i}') for i in range(3)]
        rns = [ResourceName.parse(o.urn) for o in objs]
        result = ResourceName.bulk_get_instance(rns)
        self.assertEqual(len(result), 3)
        for rn, obj in zip(rns, objs):
            self.assertEqual(result[rn].pk, obj.pk)

    def test_bulk_get_instance_missing_skipped(self):
        obj = UrnSupportedModel.objects.create(uid='bulk-exists')
        missing = ResourceName(app_label='splinter_tests', model_name='urnsupportedmodel', uid='bulk-missing')
        rns = [ResourceName.parse(obj.urn), missing]
        result = ResourceName.bulk_get_instance(rns)
        self.assertEqual(len(result), 1)
        self.assertNotIn(missing, result)

    def test_bulk_get_instance_empty_list(self):
        result = ResourceName.bulk_get_instance([])
        self.assertEqual(result, {})
