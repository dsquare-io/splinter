import datetime
import hashlib
import random

from django.conf import settings
from django.contrib.auth.models import UserManager as AuthUserManager
from django.db import models
from django.db.models import ExpressionWrapper, F
from django.db.models.functions import Now
from django.utils import timezone

from splinter.apps.user.postman import send_verification_email
from splinter.db.soft_delete import SoftDeleteManager


class UserManager(SoftDeleteManager, AuthUserManager):
    pass


class EmailVerificationManager(models.Manager):
    def create_for_user(self, user):
        bits = [str(random.SystemRandom().getrandbits(512))]
        verification_token = hashlib.sha256(''.join(bits).encode('utf-8')).hexdigest()

        # TODO: Verify uniqueness of verification_token
        return self.create(email=user.email, verification_token=verification_token)

    def delete_expired_verifications(self):
        qs = self.annotate(
            expiration_date=ExpressionWrapper(
                F('dispatched_at') + datetime.timedelta(days=settings.EMAIL_VERIFICATION_EXPIRE_DAYS),
                output_field=models.DateTimeField()
            )
        )

        return qs.filter(expiration_date__gte=Now()).delete()

    def send_email(self, user):
        email_verification = self.filter(email=user.email).first()
        if email_verification is None:
            email_verification = self.create_for_user(user)

        email_verification_url = f'{settings.PUBLIC_URL}/verify?code={email_verification.verification_token}'

        send_verification_email(user, email_verification_url)
        email_verification.dispatched_at = timezone.now()
        email_verification.save(update_fields=['dispatched_at'])
