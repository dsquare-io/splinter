import re

from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template import TemplateDoesNotExist
from django.template.loader import render_to_string


@shared_task
def send_template_mail(context, directory, recipients, sender_email=None, fail_silently=True):
    subject = render_to_string(directory + '/subject.txt', context)
    context['subject'] = subject
    context['SITE_NAME'] = settings.SITE_NAME
    plain_body = render_to_string(directory + '/body.txt', context)

    try:
        html_body = render_to_string(directory + '/body.html', context)
    except TemplateDoesNotExist:
        html_body = None

    send_mail(
        subject=subject,
        recipients=recipients,
        body_html=html_body,
        body_text=plain_body,
        sender=sender_email,
        fail_silently=fail_silently
    )


@shared_task
def send_mail(subject, recipients, body_html=None, body_text=None, sender=None, fail_silently=True):
    if not body_text:
        if not body_html:
            body_text = '(empty)'
        else:
            body_text = 'Please have a look over HTML Alternative Content'

    if isinstance(recipients, str):
        recipients = [recipients]

    subject = re.sub(r'(?<=[a-z])\r?\n', ' ', subject)  # Email subject *must not* contain newlines
    email_message = EmailMultiAlternatives(
        subject=subject, body=body_text, from_email=sender or settings.DEFAULT_FROM_EMAIL, to=recipients
    )

    if body_html:
        email_message.attach_alternative(body_html, 'text/html')

    email_message.send(fail_silently=fail_silently)
