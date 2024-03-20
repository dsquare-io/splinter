import random
import re
import string
from html.parser import HTMLParser
from textwrap import wrap

WHITE_SPACE_RE = re.compile(r'\s+')
FIRST_CAP_RE = re.compile('(.)([A-Z][a-z]+)')
ALL_CAP_RE = re.compile('([a-z0-9])([A-Z])')
UNDERSCORE_RE = re.compile(r'[a-z]_[a-z]')


def underscore_to_camel(value: str) -> str:
    return re.sub(UNDERSCORE_RE, lambda m: m.group()[0] + m.group()[2].upper(), value)


def camel_to_underscore(name: str) -> str:
    s1 = FIRST_CAP_RE.sub(r'\1_\2', name)
    return ALL_CAP_RE.sub(r'\1_\2', s1).lower()


def pascal_to_title(name: str) -> str:
    s1 = FIRST_CAP_RE.sub(r'\1 \2', name)
    return ALL_CAP_RE.sub(r'\1 \2', s1).title()


def pascal_to_slug(name: str) -> str:
    s1 = FIRST_CAP_RE.sub(r'\1-\2', name)
    return ALL_CAP_RE.sub(r'\1-\2', s1).lower()


def snake_to_title(name: str) -> str:
    return name.replace('_', ' ').title()


def generate_random_string(length: int) -> str:
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(length))


class HTMLFilter(HTMLParser):
    EXCLUDED_BODY_TAGS = ('head', 'script', 'style')

    INLINE_TAGS = ('a', 'b', 'small', 'strong', 'i', 'span')

    def __init__(self, *args, **kwargs):
        self.paragraphs = []
        self.current_tag = None
        self.ignore_data = False
        self.current_tag_additional_data = None
        super().__init__(*args, **kwargs)

    def handle_starttag(self, tag: str, attrs):
        self.current_tag = tag.lower()
        if self.current_tag == 'p' and self.paragraphs and self.paragraphs[-1]:
            self.paragraphs.append('')

        if not self.ignore_data:
            self.ignore_data = self.current_tag in self.EXCLUDED_BODY_TAGS

        self.current_tag_additional_data = None
        if self.current_tag == 'a':
            self.current_tag_additional_data = dict(attrs).get('href')

    def handle_endtag(self, tag):
        current_tag = tag.lower()
        if current_tag == 'p':
            self.paragraphs.append('')

        if self.ignore_data and current_tag in self.EXCLUDED_BODY_TAGS:
            self.ignore_data = False

    def handle_data(self, data):
        if self.ignore_data:
            return

        data = WHITE_SPACE_RE.sub(' ', data).strip()
        if not data:
            return

        if self.current_tag in self.INLINE_TAGS and len(self.paragraphs) > 1:
            self.paragraphs[-1] = f'{self.paragraphs[-1]} {data}'.strip()
        else:
            self.paragraphs.append(data)

        if self.current_tag_additional_data:
            self.paragraphs[-1] = f'{self.paragraphs[-1]} {self.current_tag_additional_data}'


def convert_html_to_text(html: str, wrap_width: int | None = None) -> str:
    instance = HTMLFilter()
    instance.feed(html)

    if wrap_width:
        paragraphs = []
        for para in instance.paragraphs:
            lines = wrap(para, wrap_width)
            if lines:
                paragraphs.extend(lines)
            else:
                paragraphs.append('')
    else:
        paragraphs = instance.paragraphs

    return '\n'.join(paragraphs).strip()
