import binascii
import os

from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import ec
from django.conf import settings

_ALGORITHM_CURVES: dict[str, ec.EllipticCurve] = {
    'ES256': ec.SECP256R1(),
    'ES384': ec.SECP384R1(),
    'ES512': ec.SECP521R1(),
}


def generate_jti() -> str:
    return binascii.hexlify(os.urandom(settings.AUTHN_JTI_LENGTH // 2)).decode()


def generate_private_key(algorithm: str) -> ec.EllipticCurvePrivateKey:
    curve = _ALGORITHM_CURVES.get(algorithm)
    if curve is None:
        raise ValueError(f'Unsupported algorithm: {algorithm}')
    return ec.generate_private_key(curve, default_backend())
