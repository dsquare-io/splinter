from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework.relations import SlugRelatedField

from splinter.apps.friend.models import Friendship


@extend_schema_field(OpenApiTypes.STR)
class FriendSerializerField(SlugRelatedField):
    default_error_messages = {
        'does_not_exist': 'Friend with {slug_name}={value} does not exist.',
    }

    def __init__(self, **kwargs):
        kwargs['slug_field'] = 'username'
        self.include_self = kwargs.pop('include_self', False)
        super().__init__(**kwargs)

    def get_queryset(self):
        return Friendship.objects.get_user_friends(self.context['request'].user, include_self=self.include_self)
