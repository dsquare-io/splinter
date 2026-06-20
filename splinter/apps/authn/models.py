from django.conf import settings
from django.db import models

from splinter.apps.authn import ACCESS_TOKEN_ALGORITHM, REFRESH_TOKEN_ALGORITHM
from splinter.apps.authn.utils import generate_jti, generate_private_key
from splinter.db.models import (
    EncryptedChar,
    EncryptedCharField,
    EncryptedEllipticCurvePrivateKey,
    EncryptedEllipticCurvePrivateKeyField,
    TimestampedModel,
)


class GlobalKey(TimestampedModel, models.Model):
    KEY_TYPE_ACCESS = 'access'
    KEY_TYPE_ATTACHMENT = 'attachment'
    KEY_TYPE_REFRESH = 'refresh'

    KEY_TYPE_ALGORITHMS = {
        KEY_TYPE_ACCESS: ACCESS_TOKEN_ALGORITHM,
        KEY_TYPE_ATTACHMENT: ACCESS_TOKEN_ALGORITHM,
        KEY_TYPE_REFRESH: REFRESH_TOKEN_ALGORITHM,
    }

    key_type = models.CharField(max_length=10)
    version = models.PositiveSmallIntegerField()
    private_key = EncryptedEllipticCurvePrivateKeyField()

    class Meta:
        db_table = 'global_keys'
        unique_together = [('key_type', 'version')]

    @property
    def kid(self) -> str:
        return f'{self.key_type}_v{self.version}'

    def save(self, **kwargs):
        if not self.private_key:
            algorithm = self.KEY_TYPE_ALGORITHMS[self.key_type]
            self.private_key = EncryptedEllipticCurvePrivateKey.encode(generate_private_key(algorithm))

        return super().save(**kwargs)


class UserSecret(TimestampedModel, models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    jti = EncryptedCharField()

    class Meta:
        db_table = 'user_secrets'

    def save(self, **kwargs):
        if not self.jti:
            self.jti = EncryptedChar.encode(generate_jti())

        return super().save(**kwargs)
