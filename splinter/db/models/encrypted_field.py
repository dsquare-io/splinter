from cryptography.fernet import Fernet
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import models


def get_encryption_key(key_hash: str) -> bytes:
    if not settings.ENCRYPTION_KEYS:
        raise ImproperlyConfigured(
            'No encryption keys defined in settings.ENCRYPTION_KEYS. To define encryption keys, '
            'set the ENCRYPTION_KEY_{HASH} environment variables, where {HASH} is the first 8 bits of SHA-1 '
            'hash of the key value in uppercase.'
            '\n\n'
            'For example to define an encryption key of 1234567890123456 you would set the environment '
            'variable `ENCRYPTION_KEY_DEED2A8=1234567890123456`'
        )

    try:
        return settings.ENCRYPTION_KEYS[key_hash]
    except KeyError:
        raise ValueError(f'Unknown encryption key hash "{key_hash}"')


class AbstractEncryptedValue[T]:
    SEPARATOR = b'\0'

    def __init__(self, value: bytes | memoryview | str) -> None:
        if isinstance(value, memoryview):
            value = value.tobytes()

        self.value: bytes = value

    def decode(self) -> T:
        key_hash, encrypted_value = self.value.split(self.SEPARATOR, 1)
        key_hash = key_hash.hex()
        return self.decrypt(encrypted_value, get_encryption_key(key_hash))

    def decrypt(self, encrypted_value: bytes, encryption_key: bytes) -> T:
        raise NotImplementedError()

    @classmethod
    def encrypt(cls, data: T, encryption_key: bytes) -> bytes:
        raise NotImplementedError()

    @classmethod
    def encode[U](cls: type[U], data: T) -> U:
        key_hash = settings.DEFAULT_ENCRYPTION_KEY_HASH
        encrypted_value = cls.encrypt(data, get_encryption_key(key_hash))
        return cls(bytes(bytearray.fromhex(key_hash)) + cls.SEPARATOR + encrypted_value)


class EncryptedChar(AbstractEncryptedValue[str]):
    def decrypt(self, encrypted_value: bytes, encryption_key: bytes) -> str:
        fernet = Fernet(encryption_key)
        return fernet.decrypt(encrypted_value).decode('utf8')

    @classmethod
    def encrypt(cls, data: str, encryption_key: bytes) -> bytes:
        fernet = Fernet(encryption_key)
        return fernet.encrypt(data.encode('utf8'))


class EncryptedEllipticCurvePrivateKey(AbstractEncryptedValue[ec.EllipticCurvePrivateKey]):
    def decrypt(self, encrypted_value: bytes, encryption_key: bytes) -> ec.EllipticCurvePrivateKey:
        return serialization.load_pem_private_key(encrypted_value, password=encryption_key, backend=default_backend())

    @classmethod
    def encrypt(cls, private_key: ec.EllipticCurvePrivateKey, encryption_key: bytes) -> bytes:
        return private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.TraditionalOpenSSL,
            encryption_algorithm=serialization.BestAvailableEncryption(encryption_key),
        )


class AbstractEncryptedField(models.BinaryField):
    encrypted_value_class: type[AbstractEncryptedValue]

    def __init__(self, **kwargs):
        kwargs.setdefault('editable', False)
        super().__init__(**kwargs)

    def from_db_value(self, value, expression, connection):
        if value is not None:
            return self.encrypted_value_class(value)

        return value

    def to_python(self, value):
        value = super().to_python(value)

        if value is not None and isinstance(value, (bytes, memoryview)):
            return self.encrypted_value_class(value)

        return value

    def get_prep_value(self, value):
        if isinstance(value, self.encrypted_value_class):
            value = value.value

        if not value:  # Treat empty value as null
            return None

        return super().get_prep_value(value)


class EncryptedEllipticCurvePrivateKeyField(AbstractEncryptedField):
    encrypted_value_class = EncryptedEllipticCurvePrivateKey

    def get_prep_value(self, value):
        if isinstance(value, ec.EllipticCurvePrivateKey):
            value = self.encrypted_value_class.encode(value)

        return super().get_prep_value(value)


class EncryptedCharField(AbstractEncryptedField):
    encrypted_value_class = EncryptedChar

    def to_python(self, value):
        if isinstance(value, str):
            value = self.encrypted_value_class.encode(value)

        return super().to_python(value)

    def get_prep_value(self, value):
        if isinstance(value, str):
            value = self.encrypted_value_class.encode(value)

        return super().get_prep_value(value)
