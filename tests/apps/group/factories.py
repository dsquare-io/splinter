import factory
from factory.django import DjangoModelFactory

from splinter.apps.group.models import Group


class GroupFactory(DjangoModelFactory):
    class Meta:
        model = Group

    name = factory.Sequence(lambda n: f'Group {n}')
    created_by = factory.SubFactory('tests.apps.user.factories.UserFactory')
