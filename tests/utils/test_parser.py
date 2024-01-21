from django.test import SimpleTestCase

from splinter.utils.parser import parse_bool, parse_float, parse_int


class ParseTests(SimpleTestCase):
    def test_parse_int(self):
        params = [
            ('invalid', None),
            ('12', 12),
            ('12.12', None),
        ]

        for input_, expected_output in params:
            with self.subTest(input_):
                self.assertEqual(parse_int(input_), expected_output)

    def test_parse_int__fallback(self):
        self.assertEqual(parse_int('invalid', default=12), 12)

    def test_parse_bool(self):
        params = [
            ('yes', None),
            ('true', True),
            ('tRue', True),
            ('False', False),
            ('fAlse', False),
            ('0', False),
            ('1', True),
        ]

        for input_, expected_output in params:
            with self.subTest(input_):
                self.assertEqual(parse_bool(input_), expected_output)

    def test_parse_bool__fallback(self):
        self.assertEqual(parse_bool('invalid', default=False), False)

    def test_parse_float(self):
        params = [
            ('invalid', None),
            ('12', 12.0),
            ('12.12', 12.12),
        ]

        for input_, expected_output in params:
            with self.subTest(input_):
                self.assertEqual(parse_float(input_), expected_output)

    def test_parse_float__fallback(self):
        self.assertEqual(parse_float('invalid', default=10.1), 10.1)
