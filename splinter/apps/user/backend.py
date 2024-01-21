from typing import Any, Optional

from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from django.http import HttpRequest

from splinter.apps.user.models import User


class AuthBackend(ModelBackend):
    supports_object_permissions = False
    supports_anonymous_user = False
    supports_inactive_user = False

    def authenticate(self, request: HttpRequest, **kwargs: Any) -> Optional[User]:
        username = kwargs.get(User.USERNAME_FIELD)
        password = kwargs.get('password')

        if not username or not password:
            return

        try:
            user = User.objects.get(Q(username=username) | Q(email__iexact=username))
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            User().set_password(password)
        else:
            if user.check_password(password) and user.is_active:
                return user
