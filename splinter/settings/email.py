import os

from splinter.utils.parser import parse_bool, parse_int

DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'no-reply@dsquare.io')

if os.getenv('EMAIL_BACKEND') == 'smtp':
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.getenv('EMAIL_HOST')
    EMAIL_PORT = parse_int(os.getenv('EMAIL_PORT'), 25)
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
    EMAIL_USE_TLS = parse_bool(os.getenv('EMAIL_USE_TLS'), False)
    EMAIL_USE_SSL = parse_bool(os.getenv('EMAIL_USE_SSL'), False)
else:
    EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
    EMAIL_FILE_PATH = '/tmp/splinter-emails/'
