from rest_framework.relations import SlugRelatedField

from splinter.apps.friend.shortcuts import get_user_friends


class FriendSerializerField(SlugRelatedField):
    def __init__(self, **kwargs):
        kwargs['slug_field'] = 'username'
        super().__init__(**kwargs)

    def get_queryset(self):
        return get_user_friends(self.context['request'].user.id)
