import binascii
import os

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import ec
from django.conf import settings


def generate_jti() -> str:
    return binascii.hexlify(os.urandom(settings.AUTHN_JTI_LENGTH // 2)).decode()


def generate_private_key() -> ec.EllipticCurvePrivateKey:
    return ec.generate_private_key(ec.SECP256R1(), default_backend())
