from django.test import TestCase
from parameterized import parameterized

from splinter.db.urn import ResourceName


class UrnTests(TestCase):
    @parameterized.expand(
        [
            ('urn:splinter:expense', 'expense', 'expense', None),
            ('urn:splinter:expense/1', 'expense', 'expense', '1'),
            ('urn:splinter:expense:party', 'expense', 'party', None),
            ('urn:splinter:expense:party/1', 'expense', 'party', '1'),
        ]
    )
    def test_parse_urn(self, urn, expected_app_label, expected_model_name, expected_uid):
        urn = ResourceName.parse(urn)
        self.assertEqual(urn.app_label, expected_app_label)
        self.assertEqual(urn.model_name, expected_model_name)
        self.assertEqual(urn.uid, expected_uid)
