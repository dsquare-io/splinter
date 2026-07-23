import os
from datetime import timedelta

from splinter.utils.parser import parse_int

SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'sessions'

CSRF_USE_SESSIONS = True

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = ('splinter.apps.user.backend.AuthBackend',)

AUTHN_JTI_LENGTH = 8
AUTHN_REFRESH_TOKEN_ENABLED = True
AUTHN_ACCESS_TOKEN_EXPIRY = timedelta(minutes=5)
AUTHN_ACCESS_TOKEN_KEY_VERSION = parse_int(os.getenv('AUTHN_ACCESS_TOKEN_KEY_VERSION', '1'))
AUTHN_REFRESH_TOKEN_KEY_VERSION = parse_int(os.getenv('AUTHN_REFRESH_TOKEN_KEY_VERSION', '1'))

ATTACHMENT_TOKEN_EXPIRY = timedelta(weeks=1)
ATTACHMENT_TOKEN_SECRET = os.getenv('ATTACHMENT_TOKEN_SECRET')

OTP_TOTP_ISSUER = 'Splinter'
AUTH_USER_MODEL = 'user.User'


def configure_auth(settings):
    if not settings['ATTACHMENT_TOKEN_SECRET']:
        settings['ATTACHMENT_TOKEN_SECRET'] = settings['SECRET_KEY']
