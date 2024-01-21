import os
from pathlib import Path

from splinter.utils.parser import parse_bool

DEBUG = parse_bool(os.getenv('DJANGO_DEBUG'), False)
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', '<splinter-fake-secret-key>')
BASE_DIR = str(Path(__file__).resolve().parent.parent.parent)

ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
WSGI_APPLICATION = 'splinter.wsgi.application'
ROOT_URLCONF = 'splinter.urls'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

LANGUAGE_CODE = 'en-us'
USE_I18N = True
USE_L10N = True
USE_TZ = True
TIME_ZONE = os.getenv('TIME_ZONE', 'UTC')

WITHIN_TEST_SUITE = parse_bool(os.getenv('WITHIN_TEST_SUITE'), False)
