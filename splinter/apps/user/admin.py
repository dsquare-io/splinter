from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as AuthUserAdmin

from splinter.apps.user.models import EmailVerification, User


@admin.action(description='Send Verification Email')
def resend_email_verification(modeladmin, request, queryset):
    for user in queryset:
        EmailVerification.objects.send_email(user)


@admin.register(User)
class UserAdmin(AuthUserAdmin):
    fieldsets = AuthUserAdmin.fieldsets[:-1]
    list_filter = ('is_staff', 'is_superuser', 'groups')
    actions = [resend_email_verification]
