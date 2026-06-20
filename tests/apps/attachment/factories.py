from django.core.files.base import ContentFile
from factory import LazyAttribute, Sequence, SubFactory
from factory.django import DjangoModelFactory

from splinter.apps.attachment.models import FileAttachment
from tests.apps.user.factories import UserFactory


class FileAttachmentFactory(DjangoModelFactory):
    class Meta:
        model = FileAttachment

    file = LazyAttribute(lambda o: ContentFile(b'test', name=o.file_name))
    file_name = Sequence(lambda n: f'file-{n}.jpg')
    file_size = 1024
    content_type = 'application/pdf'
    created_by = SubFactory(UserFactory)
    is_processed = False
