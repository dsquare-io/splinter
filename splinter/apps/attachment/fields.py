from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework.relations import SlugRelatedField

from splinter.apps.attachment.models import FileAttachment


@extend_schema_field(OpenApiTypes.UUID)
class FileAttachmentField(SlugRelatedField):
    default_error_messages = {
        'does_not_exist': 'File attachment with uid={value} does not exist.',
    }

    def __init__(self, **kwargs):
        kwargs['slug_field'] = 'public_id'
        super().__init__(**kwargs)

    def get_queryset(self):
        return FileAttachment.objects.filter(created_by=self.context['request'].user)
