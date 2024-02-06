from django.conf import settings
from django.db import models

from splinter.apps.authn.utils import generate_jti, generate_private_key
from splinter.db.encrypted_field import (
    EncryptedChar,
    EncryptedCharField,
    EncryptedEllipticCurvePrivateKey,
    EncryptedEllipticCurvePrivateKeyField,
)


class UserSecret(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    jti = EncryptedCharField()
    private_key = EncryptedEllipticCurvePrivateKeyField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_secrets'

    def save(self, **kwargs):
        if not self.jti:
            self.jti = EncryptedChar.encode(generate_jti())

        if not self.private_key:
            self.private_key = EncryptedEllipticCurvePrivateKey.encode(generate_private_key())

        return super().save(**kwargs)
