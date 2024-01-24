from datetime import timedelta
from typing import TYPE_CHECKING

from django.conf import settings

from splinter.apps.user.utils import timedelta_to_string
from splinter.tasks import send_template_mail

if TYPE_CHECKING:
    from splinter.apps.user.models import User
    from splinter.apps.user.request_identity import RequestIdentity


def send_password_reset_email(user: 'User', password_reset_url: str, request_identity: 'RequestIdentity') -> None:
    delta = timedelta(seconds=settings.PASSWORD_RESET_TIMEOUT)

    send_template_mail(
        subject='Reset Your Password',
        recipients=user.email,
        template_name='user/password-reset.html',
        context={
            'user': user,
            'password_reset_url': password_reset_url,
            'request_identity': request_identity,
            'link_expires_in': timedelta_to_string(delta),
        },
    )


def send_verification_email(user: 'User', email_verification_url: str) -> None:
    send_template_mail(
        subject='Confirm Your Email Address',
        recipients=user.email,
        template_name='user/verify-email.html',
        context={
            'user': user,
            'email_verification_url': email_verification_url,
        },
    )


def send_invitation_email(user: 'User', accept_invitation_url: str, invited_by: 'User') -> None:
    send_template_mail(
        subject=f'{invited_by.display_name} Invites You to Join {settings.SITE_NAME}',
        recipients=user.email,
        template_name='user/invitation.html',
        context={
            'user': user,
            'accept_invitation_url': accept_invitation_url,
            'invited_by': invited_by,
        },
    )
