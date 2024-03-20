from django.test import SimpleTestCase

from splinter.core.renderers import to_camel_case


class ToCamelCaseTests(SimpleTestCase):
    def test_to_camel_case(self):
        params = [
            ('pascal case dict', {'someKey': 'some_value'}, {'someKey': 'some_value'}),
            ('camel case dict', {'some_key': 'some_value'}, {'someKey': 'some_value'}),
            ('list of dict', [{'some_key': 'some_value'}], [{'someKey': 'some_value'}]),
            ('tuple of dict', ({'some_key': 'some_value'},), [{'someKey': 'some_value'}]),
        ]

        for name, input_, expected_output in params:
            with self.subTest(name):
                self.assertEqual(to_camel_case(input_), expected_output)
