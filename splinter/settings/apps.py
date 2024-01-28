import os
from datetime import timedelta

from splinter.utils.parser import parse_bool

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # External Applications
    'rest_framework',
    'drf_spectacular',
    'django_otp',
    'django_otp.plugins.otp_totp',
    'django_otp.plugins.otp_static',

    # Internal Applications
    'splinter.apps.currency',
    'splinter.apps.expense',
    'splinter.apps.friend',
    'splinter.apps.group',
    'splinter.apps.mfa',
    'splinter.apps.token',
    'splinter.apps.user',
]

MFA_BACKUP_CODES_COUNT = 10
MFA_ACCESS_TOKEN_EXPIRY = timedelta(minutes=5)

ACCESS_TOKEN_EXPIRY = timedelta(days=7)
EMAIL_VERIFICATION_EXPIRE_DAYS = 7

USERNAME_MIN_LENGTH = 5
SIGNUP_ENABLED = parse_bool(os.getenv('SIGNUP_ENABLED'), False)
