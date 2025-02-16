import factory
from factory.django import DjangoModelFactory

from splinter.apps.activity.activities import ActivityType
from splinter.apps.activity.models import Activity, Comment
from tests.apps.group.factories import GroupFactory
from tests.apps.user.factories import UserFactory

FakeActivity = ActivityType(
    verb='fake',
    template='{actor} {verb} on {target}',
)


class ActivityFactory(DjangoModelFactory):
    class Meta:
        model = Activity

    actor = factory.SubFactory(UserFactory)
    group = None
    verb = 'fake'


class GroupActivityFactory(ActivityFactory):
    group = factory.SubFactory(GroupFactory)


class CommentFactory(DjangoModelFactory):
    class Meta:
        model = Comment

    user = factory.SubFactory(UserFactory)
    activity = factory.SubFactory(ActivityFactory)
    content = factory.Faker('paragraph', nb_sentences=1)
