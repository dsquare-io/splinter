import factory
from factory.django import DjangoModelFactory

from splinter.apps.group.models import Group


class GroupFactory(DjangoModelFactory):
    class Meta:
        model = Group

    name = factory.Sequence(lambda n: f'Group {n}')
    created_by = factory.SubFactory('tests.apps.user.factories.UserFactory')

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        group = super()._create(model_class, *args, **kwargs)
        GroupMembershipFactory(group=group, user=group.created_by)
        return group


class GroupMembershipFactory(DjangoModelFactory):
    class Meta:
        model = 'group.GroupMembership'

    group = factory.SubFactory(GroupFactory)
    user = factory.SubFactory('tests.apps.user.factories.UserFactory')
