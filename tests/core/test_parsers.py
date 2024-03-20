from django.test import SimpleTestCase

from splinter.core.parsers import to_snake_case


class SnakeCaseConversionTests(SimpleTestCase):
    def test_to_snake_case(self):
        params = [
            ('pascal case dict', {'someKey': 'some_value'}, {'some_key': 'some_value'}),
            ('camel case dict', {'some_key': 'some_value'}, {'some_key': 'some_value'}),
            ('list of dict', [{'someKey': 'some_value'}], [{'some_key': 'some_value'}]),
            ('tuple of dict', ({'someKey': 'some_value'},), [{'some_key': 'some_value'}]),
        ]

        for name, input_, expected_output in params:
            with self.subTest(name):
                self.assertEqual(to_snake_case(input_), expected_output)
