from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin

from splinter.apps.user.models import EmailVerification, User, UserInvitation
from splinter.apps.user.postman import send_invitation_email


@admin.action(description='Send Verification Email')
def resend_email_verification(modeladmin, request, queryset):
    n_sent = 0

    for user in queryset:
        if user.is_verified:
            messages.add_message(request, messages.WARNING, f'User {user}({user.pk}) is already verified')
        else:
            EmailVerification.objects.send_email(user)
            n_sent += 1

    messages.add_message(request, messages.INFO, f'{n_sent} verification email(s) sent')


@admin.action(description='Resend Invitation')
def resend_invitation(modeladmin, request, queryset):
    n_sent = 0

    for user in queryset:
        if user.is_active:
            messages.add_message(request, messages.WARNING, f'User {user}({user.pk}) is already active')
        else:
            last_invitation = UserInvitation.objects.filter(invitee=user).order_by('-created_at').first()

            send_invitation_email(
                user,
                last_invitation.inviter if last_invitation else request.user,
            )

            EmailVerification.objects.send_email(user)
            n_sent += 1

    messages.add_message(request, messages.INFO, f'{n_sent} invitation email(s) sent')


@admin.register(User)
class UserAdmin(AuthUserAdmin):
    fieldsets = AuthUserAdmin.fieldsets[:-1]
    list_filter = ('is_staff', 'is_superuser', 'groups')
    actions = [resend_email_verification, resend_invitation]
