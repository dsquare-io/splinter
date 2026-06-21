from django.conf import settings
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.exceptions import APIException, UnsupportedMediaType

from splinter.apps.attachment.models import FileAttachment
from splinter.apps.attachment.token import generate_attachment_token


def _format_size(size: int) -> str:
    if size >= 1024 * 1024:
        return f'{size / (1024 * 1024):.1f} MB'
    if size >= 1024:
        return f'{size / 1024:.1f} KB'
    return f'{size} B'


class CreateFileAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileAttachment
        fields = ('file',)

    @staticmethod
    def validate_file(file):
        max_size = settings.ATTACHMENT_MAX_FILE_SIZE
        if file.size > max_size:
            raise APIException(
                detail=f'File size ({_format_size(file.size)}) exceeds maximum allowed {_format_size(max_size)}.',
                code='file_too_large',
            )

        allowed_types = settings.ATTACHMENT_ALLOWED_CONTENT_TYPE_EXTENSIONS
        if file.content_type.lower() not in allowed_types:
            raise UnsupportedMediaType(file.content_type)

        return file

    def create(self, validated_data):
        file = validated_data['file']
        return FileAttachment.objects.create(
            file=file,
            file_name=file.name,
            file_size=file.size,
            content_type=file.content_type.lower(),
            created_by=self.context['request'].user,
        )


class AttachmentConfigSerializer(serializers.Serializer):
    max_file_size = serializers.IntegerField(read_only=True)
    allowed_content_types = serializers.ListField(child=serializers.CharField(), read_only=True)
    allowed_extensions = serializers.ListField(child=serializers.CharField(), read_only=True)


class FileAttachmentSerializer(serializers.ModelSerializer):
    urn = serializers.CharField(read_only=True)
    uid = serializers.CharField(source='public_id', read_only=True)

    url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = FileAttachment
        fields = ('uid', 'urn', 'file_name', 'file_size', 'content_type', 'url', 'thumbnail_url')

    def generate_auth_token(self, attachment: FileAttachment) -> str:
        cache = self.__dict__.setdefault('_auth_token_cache', {})
        if attachment.pk not in cache:
            cache[attachment.pk] = generate_attachment_token(attachment)
        return cache[attachment.pk]

    @extend_schema_field(serializers.URLField())
    def get_url(self, attachment: FileAttachment) -> str:
        token = self.generate_auth_token(attachment)
        return f'/media/attachments/{attachment.public_id}?token={token}'

    @extend_schema_field(serializers.URLField(allow_null=True))
    def get_thumbnail_url(self, attachment: FileAttachment) -> str | None:
        if attachment.thumbnail:
            token = self.generate_auth_token(attachment)
            return f'/media/attachments/{attachment.public_id}/thumbnail?token={token}'

        return None
