from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers, status
from rest_framework.exceptions import APIException

from splinter.apps.media.models import MediaFile

ACCEPTED_MIME_TYPES = frozenset({'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'})
MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_ATTACHMENTS = 10


class RequestEntityTooLarge(APIException):
    status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    default_detail = 'File size exceeds the 10 MB limit.'
    default_code = 'file_too_large'


class MediaFileSerializer(serializers.ModelSerializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)
    signed_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaFile
        fields = ('uid', 'original_filename', 'content_type', 'file_size', 'processed', 'signed_url')

    @extend_schema_field(serializers.URLField(allow_null=True))
    def get_signed_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class MediaUrlSerializer(serializers.Serializer):
    url = serializers.URLField()
