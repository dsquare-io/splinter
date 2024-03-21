from typing import Any

from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from splinter.utils.strings import convert_html_to_text


def send_template_mail(
    subject: str,
    recipients: str | list[str],
    context: dict[str, Any],
    template_name: str,
    sender: str | None = None,
    fail_silently: bool = True,
):
    context['subject'] = subject
    context['SITE_NAME'] = settings.SITE_NAME
    context['CONTACT_EMAIL'] = settings.CONTACT_EMAIL
    html_body = render_to_string(template_name, context)

    send_mail.delay(
        subject=subject,
        recipients=recipients,
        body_html=html_body,
        sender=sender,
        fail_silently=fail_silently,
    )


@shared_task
def send_mail(
    subject: str,
    recipients: str | list[str],
    body_html: str | None = None,
    body_text: str | None = None,
    sender: str | None = None,
    fail_silently: bool = True,
):
    if not body_html and not body_text:
        raise ValueError('Either `body_html`, `body_text` or both must be provided')

    if not body_text:
        body_text = convert_html_to_text(body_html, wrap_width=80)

    if isinstance(recipients, str):
        recipients = [recipients]

    email_message = EmailMultiAlternatives(
        subject=subject,
        body=body_text,
        from_email=sender or settings.DEFAULT_FROM_EMAIL,
        to=recipients,
    )

    if body_html:
        email_message.attach_alternative(body_html, 'text/html')

    email_message.send(fail_silently=fail_silently)
