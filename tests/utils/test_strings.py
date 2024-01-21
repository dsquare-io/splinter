from django.test import SimpleTestCase

from splinter.utils.strings import camel_to_underscore, underscore_to_camel


class StringsTests(SimpleTestCase):
    def test_underscore_to_camel(self):
        params = [
            ('some_value', 'someValue'),
            ('some__value', 'some__value'),
            ('some', 'some'),
            ('_value', '_value'),
            ('some_', 'some_'),
        ]

        for input_, expected in params:
            with self.subTest(input_):
                self.assertEqual(underscore_to_camel(input_), expected)

    def test_camel_to_underscore(self):
        params = [
            ('someValue', 'some_value'),
            ('someHTTP', 'some_http'),
            ('HTTPWorld', 'http_world'),
            ('HTTP', 'http'),
        ]

        for input_, expected in params:
            with self.subTest(input_):
                self.assertEqual(camel_to_underscore(input_), expected)
