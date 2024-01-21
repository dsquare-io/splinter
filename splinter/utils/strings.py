import random
import re
import string

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
