from rest_framework.relations import SlugRelatedField

from splinter.apps.group.models import Group


class GroupSerializerField(SlugRelatedField):
    def __init__(self, **kwargs):
        kwargs['slug_field'] = 'public_id'
        super().__init__(**kwargs)

    def get_queryset(self):
        return Group.objects.of(self.context['request'].user.id)
