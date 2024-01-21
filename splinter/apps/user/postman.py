from splinter.tasks import send_template_mail


def send_password_reset_email(user, password_reset_url, request_identity):
    send_template_mail.delay(
        recipients=user.email,
        directory='user/reset-password',
        context={
            'user': user,
            'password_reset_url': password_reset_url,
            'request_identity': request_identity,
        }
    )


def send_verification_email(user, email_verification_url):
    send_template_mail.delay(
        recipients=user.email, directory='user/verification', context={
            'user': user,
            'url': email_verification_url,
        }
    )
