import os

from splinter.utils.parser import parse_int

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB_NAME', 'splinter'),
        'USER': os.getenv('POSTGRES_USERNAME', 'splinter'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('POSTGRES_HOSTNAME', 'localhost'),
        'PORT': parse_int(os.getenv('POSTGRES_PORT'), 5432),
        'CONN_MAX_AGE': 60 * 60  # 1 hour
    }
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


def configure_database(settings):
    if settings['WITHIN_TEST_SUITE']:
        settings['USING_POSTGRES'] = False
        settings['DATABASES']['default'] = {
            'ENGINE': 'django.db.backends.sqlite3',
        }
