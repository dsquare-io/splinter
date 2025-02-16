from django.contrib.auth.tokens import PasswordResetTokenGenerator as DjangoPasswordResetTokenGenerator


class PasswordResetTokenGenerator(DjangoPasswordResetTokenGenerator):
    key_salt = 'splinter.apps.user.tokens.PasswordResetTokenGenerator'


password_reset_token_generator = PasswordResetTokenGenerator()
