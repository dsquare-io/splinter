import secrets

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import UnsupportedMediaType, ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from splinter.apps.media.models import MediaFile
from splinter.apps.media.serializers import (
    MAX_FILE_SIZE,
    ACCEPTED_MIME_TYPES,
    MediaFileSerializer,
    MediaUrlSerializer,
    RequestEntityTooLarge,
    _file_ext,
)
from splinter.apps.media.storage import PrivateS3Boto3Storage
from splinter.core.views import APIView


class UploadMediaFileView(APIView):
    parser_classes = [MultiPartParser]

    @extend_schema(responses={201: MediaFileSerializer})
    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            raise ValidationError('No file provided.')

        if file.content_type not in ACCEPTED_MIME_TYPES:
            raise UnsupportedMediaType(file.content_type)
        if file.size > MAX_FILE_SIZE:
            raise RequestEntityTooLarge()

        alias = secrets.token_hex(16)
        key = f'uploads/{alias}{_file_ext(file.name)}'

        PrivateS3Boto3Storage().save(key, file)

        media_file = MediaFile.objects.create(
            file=key,
            alias=alias,
            original_filename=file.name,
            content_type=file.content_type,
            file_size=file.size,
            uploaded_by=request.user,
        )
        return Response(MediaFileSerializer(media_file).data, status=status.HTTP_201_CREATED)


class RetrieveMediaUrlView(APIView):
    @extend_schema(responses={200: MediaUrlSerializer})
    def get(self, request, *args, **kwargs):
        attachment = get_object_or_404(
            MediaFile.objects.filter(content_type_fk__isnull=False),
            public_id=self.kwargs['media_uid'],
        )
        if not attachment.file:
            raise ValidationError('File not available.')
        return Response({'url': attachment.file.url})
