import os

from rest_framework import serializers
from rest_framework.exceptions import APIException, UnsupportedMediaType

from splinter.apps.media.models import MediaFile

ACCEPTED_MIME_TYPES = frozenset({'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'})
MAX_FILE_SIZE = 10 * 1024 * 1024
MAX_ATTACHMENTS = 10


class RequestEntityTooLarge(APIException):
    status_code = 413
    default_detail = 'File size exceeds the 10 MB limit.'
    default_code = 'file_too_large'


def _file_ext(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext.lower()


class PresignedUrlRequestSerializer(serializers.Serializer):
    filename = serializers.CharField(max_length=255)
    content_type = serializers.CharField(max_length=127)
    file_size = serializers.IntegerField(min_value=1)

    def validate_content_type(self, value):
        if value not in ACCEPTED_MIME_TYPES:
            raise UnsupportedMediaType(value)
        return value

    def validate_file_size(self, value):
        if value > MAX_FILE_SIZE:
            raise RequestEntityTooLarge()
        return value


class RegisterFileSerializer(serializers.Serializer):
    alias = serializers.CharField(max_length=32)
    original_filename = serializers.CharField(max_length=255)
    content_type = serializers.CharField(max_length=127)
    file_size = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        from splinter.apps.media.storage import PrivateS3Boto3Storage

        alias = attrs['alias']
        ext = _file_ext(attrs['original_filename'])
        key = f'uploads/{alias}{ext}'

        if not PrivateS3Boto3Storage().exists(key):
            raise serializers.ValidationError({'alias': 'No file found in S3 for this alias.'})

        attrs['_s3_key'] = key
        return attrs

    def create(self, validated_data):
        return MediaFile.objects.create(
            file=validated_data['_s3_key'],
            alias=validated_data['alias'],
            original_filename=validated_data['original_filename'],
            content_type=validated_data['content_type'],
            file_size=validated_data['file_size'],
            uploaded_by=self.context['request'].user,
        )


class MediaFileSerializer(serializers.ModelSerializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)
    signed_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaFile
        fields = ('uid', 'original_filename', 'content_type', 'file_size', 'processed', 'signed_url')

    def get_signed_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class AttachFilesSerializer(serializers.Serializer):
    uids = serializers.ListField(child=serializers.UUIDField(), min_length=1, max_length=MAX_ATTACHMENTS)

    def validate_uids(self, uids):
        files = list(
            MediaFile.objects.attachable().filter(
                public_id__in=uids,
                uploaded_by=self.context['request'].user,
            )
        )
        if len(files) != len(uids):
            raise serializers.ValidationError('One or more file UIDs are not attachable or do not belong to you.')
        return files
