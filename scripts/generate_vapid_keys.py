#!/usr/bin/env python3
"""Generate VAPID key pair for push notifications.

Add the output values to your .env file.
"""

import base64

from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from py_vapid import Vapid

vapid = Vapid()
vapid.generate_keys()

# P-256 private key is a 32-byte big-endian scalar
private_scalar = vapid.private_key.private_numbers().private_value.to_bytes(32, 'big')
private_key = base64.urlsafe_b64encode(private_scalar).decode()

# Uncompressed point (0x04 || X || Y) — required by browser PushManager.subscribe()
public_key_bytes = vapid.public_key.public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)
public_key = base64.urlsafe_b64encode(public_key_bytes).decode()

print(f'VAPID_PRIVATE_KEY={private_key}')
print(f'VAPID_PUBLIC_KEY={public_key}')
