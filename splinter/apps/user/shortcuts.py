from typing import TYPE_CHECKING

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import int_to_base36

from splinter.apps.user.postman import send_invitation_email

if TYPE_CHECKING:
    from splinter.apps.user.models import User


def invite_user(user: 'User', invited_by: 'User'):
    uid = int_to_base36(user.id)
    recovery_token = default_token_generator.make_token(user)

    accept_invitation_url = f'{settings.PUBLIC_URL}/accept?uid={uid}&token={recovery_token}'
    send_invitation_email(user, accept_invitation_url, invited_by=invited_by)
