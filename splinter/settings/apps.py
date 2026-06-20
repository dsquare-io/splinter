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
    'django.contrib.postgres',
    # External Applications
    'rest_framework',
    'drf_spectacular',
    'django_otp',
    'django_otp.plugins.otp_totp',
    'django_otp.plugins.otp_static',
    # Core Apps
    'splinter.core.health',
    'splinter.core.openapi',
    # Other Apps
    'splinter',
    'splinter.apps.activity',
    'splinter.apps.attachment',
    'splinter.apps.authn',
    'splinter.apps.currency',
    'splinter.apps.expense',
    'splinter.apps.friend',
    'splinter.apps.group',
    'splinter.apps.mfa',
    'splinter.apps.notification',
    'splinter.apps.user',
]

MFA_BACKUP_CODES_COUNT = 10
MFA_ACCESS_TOKEN_EXPIRY = timedelta(minutes=5)

ACCESS_TOKEN_EXPIRY = timedelta(days=7)
ATTACHMENT_TOKEN_EXPIRY = timedelta(weeks=1)
EMAIL_VERIFICATION_EXPIRE_DAYS = 7

USERNAME_MIN_LENGTH = 5
SIGNUP_ENABLED = parse_bool(os.getenv('SIGNUP_ENABLED'), False)

EXPENSE_AGGREGATED_OUTSTANDING_BALANCE_LIMIT = 5

CURRENCY_DEFAULT_USER_PREFERENCE = 'PKR'
GROUP_MAX_ALLOWED_MEMBERS = 64
GROUP_MAX_ALLOWED_MEMBERSHIPS = 64
FRIEND_MAX_ALLOWED_FRIENDS = 64

ATTACHMENT_MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ATTACHMENT_ALLOWED_CONTENT_TYPE_EXTENSIONS = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
}
