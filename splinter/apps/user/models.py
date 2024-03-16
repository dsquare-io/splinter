import datetime
from typing import TYPE_CHECKING

from django.conf import settings
from django.contrib.auth.models import AbstractUser as AuthAbstractUser
from django.contrib.auth.validators import ASCIIUsernameValidator
from django.db import models
from django.utils import timezone

from splinter.apps.user.managers import EmailVerificationManager, UserManager
from splinter.db.soft_delete import SoftDeleteModel


class User(SoftDeleteModel, AuthAbstractUser):
    UID_FIELD = 'username'
    SEARCH_FIELDS = ['full_name', 'username', 'email']

    if TYPE_CHECKING:
        urn: str

    username_validator = ASCIIUsernameValidator()
    email = models.EmailField(unique=True, null=True, blank=True)

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    date_joined = None

    objects = UserManager()

    class Meta:
        db_table = 'users'

    @property
    def full_name(self):
        if hasattr(self, '_full_name'):
            return self._full_name

        return self.get_full_name() or self.username

    @full_name.setter
    def full_name(self, value):
        self._full_name = value

    def __str__(self):
        return f'{self.full_name} ({self.email})'

    def save(self, **kwargs):
        if not self.email:
            self.email = None

        super().save(**kwargs)


class EmailVerification(models.Model):
    email = models.EmailField(db_index=True)
    verification_token = models.CharField(max_length=64, unique=True)

    dispatched_at = models.DateTimeField(null=True, blank=True, default=None)
    verified_at = models.DateTimeField(null=True, blank=True, default=None)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = EmailVerificationManager()

    class Meta:
        db_table = 'user_email_verifications'

    def __str__(self):
        return self.email

    @property
    def confirmed(self):
        return self.verified_at is not None

    @property
    def key_expired(self):
        expiration_date = self.dispatched_at + datetime.timedelta(days=settings.EMAIL_VERIFICATION_EXPIRE_DAYS)
        return expiration_date <= timezone.now()

    def verify(self):
        if not self.key_expired and not self.confirmed:
            self.verified_at = timezone.now()
            self.save(update_fields=['verified_at'])
            return True

        return False
