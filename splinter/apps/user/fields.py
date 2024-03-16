from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework.relations import SlugRelatedField

from splinter.apps.user.models import User


@extend_schema_field(OpenApiTypes.STR)
class UserSerializerField(SlugRelatedField):
    default_error_messages = {
        'does_not_exist': 'User with {slug_name}={value} does not exist.',
    }

    def __init__(self, **kwargs):
        kwargs['slug_field'] = 'username'
        super().__init__(**kwargs)

    def get_queryset(self):
        return User.objects.all()
