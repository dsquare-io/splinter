from rest_framework.permissions import IsAuthenticated


class IsVerified(IsAuthenticated):
    """
    Allow access to only MFA verified users
    """

    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated:
            return not request.user.require_mfa

        return False
