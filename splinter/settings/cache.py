import os

from splinter.utils.parser import parse_int

REDIS_HOST = os.getenv('REDIS_HOST', '127.0.0.1')
REDIS_PORT = parse_int(os.getenv('REDIS_PORT'), 6379)
REDIS_URL = os.getenv('REDIS_URL') or f'redis://{REDIS_HOST}:{REDIS_PORT}'

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'{REDIS_URL}?db=0',
    },
    'sessions': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f'{REDIS_URL}?db=1',
    },
}
