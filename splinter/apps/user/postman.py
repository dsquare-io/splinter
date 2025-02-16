from datetime import timedelta
from typing import TYPE_CHECKING

from django.conf import settings
from django.utils.http import int_to_base36

from splinter.apps.user.tokens import password_reset_token_generator
from splinter.apps.user.utils import timedelta_to_string
from splinter.tasks import send_template_mail

if TYPE_CHECKING:
    from splinter.apps.user.models import User
    from splinter.core.request_identity import RequestIdentity


def password_reset_url(user: 'User') -> str:
    uid = int_to_base36(user.id)
    recovery_token = password_reset_token_generator.make_token(user)
    return f'{settings.PUBLIC_URL}/reset?uid={uid}&token={recovery_token}'


def invitation_url(user: 'User') -> str:
    uid = int_to_base36(user.id)
    recovery_token = password_reset_token_generator.make_token(user)

    return f'{settings.PUBLIC_URL}/auth/accept?uid={uid}&token={recovery_token}'


def email_verification_url(verification_token: str) -> str:
    return f'{settings.PUBLIC_URL}/verify?code={verification_token}'


def send_password_reset_email(user: 'User', request_identity: 'RequestIdentity') -> None:
    delta = timedelta(seconds=settings.PASSWORD_RESET_TIMEOUT)

    send_template_mail(
        subject='Reset Your Password',
        recipients=user.email,
        template_name='user/password-reset.html',
        context={
            'user': user,
            'password_reset_url': password_reset_url(user),
            'request_identity': request_identity,
            'link_expires_in': timedelta_to_string(delta),
        },
    )


def send_verification_email(user: 'User', verification_token: str) -> None:
    send_template_mail(
        subject='Confirm Your Email Address',
        recipients=user.email,
        template_name='user/verify-email.html',
        context={
            'user': user,
            'email_verification_url': email_verification_url(verification_token),
        },
    )


def send_invitation_email(user: 'User', invited_by: 'User') -> None:
    send_template_mail(
        subject=f'{invited_by.full_name} Invites You to Join {settings.SITE_NAME}',
        recipients=user.email,
        template_name='user/invitation.html',
        context={
            'user': user,
            'accept_invitation_url': invitation_url(user),
            'invited_by': invited_by,
        },
    )
