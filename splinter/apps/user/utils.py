import re

from django.conf import settings

from splinter.apps.user.models import User
from splinter.utils.strings import generate_random_string


def suggest_username(email: str) -> str:
    username = email.split('@', 1)[0]
    username = re.sub(r'[^A-Za-z0-9.]', '_', username).strip('_')
    username = re.sub(r'_+', '_', username)

    if len(username) < settings.USERNAME_MIN_LENGTH:
        username += generate_random_string(settings.USERNAME_MIN_LENGTH - len(username))

    counter = 0
    guess = username
    while User.objects.filter(username__iexact=guess).exists():
        guess = '%s_%s' % (username, counter)
        counter += 1

    return guess
