import logging
import os
from typing import Any, Dict

import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.redis import RedisIntegration

from splinter.utils.parser import parse_bool, parse_float

ADMINS = []

ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
SENTRY_DSN = os.getenv('SENTRY_DSN')
SENTRY_TRACES_SAMPLE_RATE = parse_float(os.getenv('SENTRY_TRACES_SAMPLE_RATE'), 1)
LOG_SQL_QUERIES = parse_bool(os.getenv('LOG_SQL_QUERIES'))

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[%(levelname)s] %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '[%(levelname)s] %(asctime)s - %(message)s'
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        }
    },
    'handlers': {
        'null': {
            'level': 'DEBUG',
            'class': 'logging.NullHandler',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.server': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.templates': {
            'level': 'WARNING',
        },

        # Silence SuspiciousOperation.DisallowedHost exception ('Invalid
        # HTTP_HOST' header messages). Set the handler to 'null' so we don't
        # get those annoying emails.
        'django.security.DisallowedHost': {
            'handlers': ['null'],
            'propagate': False,
        },
    }
}

if LOG_SQL_QUERIES:
    LOGGING['loggers']['django.db.backends'] = {
        'level': 'DEBUG',
        'handlers': ['console'],
        'propagate': False,
    }


def sentry_traces_sampler(sampling_context: Dict[str, Any]) -> float:
    wsgi_path = sampling_context.get('wsgi_environ', {}).get('PATH_INFO')
    if wsgi_path in ('/liveness', '/readiness'):
        return 0

    return SENTRY_TRACES_SAMPLE_RATE


if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=ENVIRONMENT,
        integrations=[
            DjangoIntegration(),
            RedisIntegration(),
            LoggingIntegration(level=logging.ERROR),
        ],
        traces_sampler=sentry_traces_sampler
    )
