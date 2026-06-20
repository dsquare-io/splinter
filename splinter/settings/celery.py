import os

from splinter.utils.parser import parse_bool

CELERY_TASK_ALWAYS_EAGER = parse_bool(os.getenv('CELERY_TASK_ALWAYS_EAGER'), False)
CELERY_TASK_SERIALIZER = 'pickle'
CELERY_RESULT_SERIALIZER = 'pickle'
CELERY_ACCEPT_CONTENT = ['pickle', 'json']

CELERY_WORKER_SEND_TASK_EVENTS = True
CELERY_TASK_SEND_SENT_EVENT = True
CELERY_WORKER_PREFETCH_MULTIPLIER = 1


def configure_celery(settings):
    settings['CELERY_BROKER_URL'] = '{}/2'.format(settings['REDIS_URL'])
    settings['CELERY_RESULT_BACKEND'] = '{}/2'.format(settings['REDIS_URL'])
