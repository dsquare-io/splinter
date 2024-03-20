import datetime
import hashlib
import random
import re

from django.conf import settings
from django.contrib.auth.models import UserManager as AuthUserManager
from django.db import models
from django.db.models import Case, CharField, ExpressionWrapper, F, Value, When
from django.db.models.functions import Concat, Now
from django.utils import timezone

from splinter.apps.user.postman import send_verification_email
from splinter.db.soft_delete import SoftDeleteManagerMixin
from splinter.utils.strings import generate_random_string

DUPLICATE_UNDERSCORE_RE = re.compile(r'_+')
DISALLOWED_USERNAME_CHARTS_RE = re.compile(r'[^A-Za-z0-9.]')


class UserManager(SoftDeleteManagerMixin, AuthUserManager):
    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .annotate(
                full_name=Case(
                    When(first_name='', last_name='', then=F('username')),
                    When(first_name='', then=F('last_name')),
                    When(
                        last_name='',
                        then=F('first_name'),
                    ),
                    default=Concat(F('first_name'), Value(' '), F('last_name')),
                    output_field=CharField(),
                )
            )
        )

    def suggest_username(self, email: str) -> str:
        username = email.split('@', 1)[0].lower()
        username = DISALLOWED_USERNAME_CHARTS_RE.sub('_', username).strip('_')
        username = DUPLICATE_UNDERSCORE_RE.sub('_', username)

        if len(username) < settings.USERNAME_MIN_LENGTH:
            username += generate_random_string(settings.USERNAME_MIN_LENGTH - len(username))

        suggested_suffix = 0

        existing_usernames = self.filter(username__istartswith=username).values_list('username', flat=True)
        for existing_username in existing_usernames:
            if existing_username == username:
                suggested_suffix = 1
                continue

            suffix = existing_username[len(username) + 1 :]
            if suffix.isdigit() and int(suffix) == suggested_suffix:
                suggested_suffix += 1

        if suggested_suffix:
            username += f'_{suggested_suffix}'

        return username


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
                output_field=models.DateTimeField(),
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
