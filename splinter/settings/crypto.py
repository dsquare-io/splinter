import base64
import binascii
import hashlib
import os
from typing import Dict

from django.core.exceptions import ImproperlyConfigured

ENCRYPTION_KEYS: Dict[str, bytes] = {}
DEFAULT_ENCRYPTION_KEY_HASH = os.getenv('DEFAULT_ENCRYPTION_KEY_HASH')


def validate_encryption_key(kh: str, kv: str):
    computed_key_hash = hashlib.sha1(kv.encode('utf8')).hexdigest()[:8]
    if kh != computed_key_hash:
        raise ImproperlyConfigured(f'Invalid key hash. Expected "{computed_key_hash}" but got "{kh}"')

    try:
        decoded_value = base64.urlsafe_b64decode(kv)
    except binascii.Error as exc:
        raise ValueError('Key must be 32 url-safe base64-encoded bytes') from exc

    if len(decoded_value) != 32:
        raise ValueError('Key must be 32 url-safe base64-encoded bytes')


for key in os.environ:
    if key.startswith('ENCRYPTION_KEY_'):
        key_hash = key[15:].lower()
        key_value = os.getenv(key)

        try:
            validate_encryption_key(key_hash, key_value)
        except ValueError as ex:
            raise ImproperlyConfigured(f'"{key}" is invalid. Reason: {ex}')

        ENCRYPTION_KEYS[key_hash] = key_value.encode('ascii')

if ENCRYPTION_KEYS:
    if not DEFAULT_ENCRYPTION_KEY_HASH:
        DEFAULT_ENCRYPTION_KEY_HASH = list(ENCRYPTION_KEYS)[0]

    elif DEFAULT_ENCRYPTION_KEY_HASH not in ENCRYPTION_KEYS:
        raise ImproperlyConfigured(
            f'"ENCRYPTION_KEY_{DEFAULT_ENCRYPTION_KEY_HASH}" environment variable is not defined'
        )
