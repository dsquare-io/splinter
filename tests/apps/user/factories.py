import factory
from factory.django import DjangoModelFactory

from splinter.apps.user.models import User


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    username = factory.Sequence(lambda n: f'user-{n}')
    email = factory.Sequence(lambda n: f'person-{n}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'password')
