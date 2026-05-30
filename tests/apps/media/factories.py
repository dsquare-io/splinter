import secrets

import factory
from factory.django import DjangoModelFactory

from splinter.apps.media.models import MediaFile


class MediaFileFactory(DjangoModelFactory):
    class Meta:
        model = MediaFile

    alias = factory.LazyFunction(lambda: secrets.token_hex(16))
    original_filename = factory.Sequence(lambda n: f'file-{n}.jpg')
    file_size = 1024
    content_type = 'image/jpeg'
    uploaded_by = factory.SubFactory('tests.apps.user.factories.UserFactory')
    file = factory.LazyAttribute(lambda o: f'uploads/{o.alias}.jpg')
