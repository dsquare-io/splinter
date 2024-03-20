from django.test import SimpleTestCase

from splinter.utils.strings import camel_to_underscore, convert_html_to_text, underscore_to_camel

TEST_HTML = """
<p>This is a paragraph</p>

<p>
    This paragraph is <br>
    multiline
</p>
"""


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

    def test_convert_html_to_text(self):
        self.assertEqual(
            convert_html_to_text(TEST_HTML), 'This is a paragraph\n' '\n' 'This paragraph is\n' 'multiline'
        )

    def test_convert_html_to_text__wrap(self):
        self.assertEqual(
            convert_html_to_text(TEST_HTML, wrap_width=120),
            'This is a paragraph\n' '\n' 'This paragraph is\n' 'multiline',
        )
