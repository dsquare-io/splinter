from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework.relations import SlugRelatedField

from splinter.apps.friend.models import Friendship


@extend_schema_field(OpenApiTypes.STR)
class FriendSerializerField(SlugRelatedField):
    def __init__(self, **kwargs):
        kwargs['slug_field'] = 'username'
        super().__init__(**kwargs)

    def get_queryset(self):
        return Friendship.objects.get_user_friends(self.context['request'].user)
