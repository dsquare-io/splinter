import secrets

from django.conf import settings
from django.http import StreamingHttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import NotFound, UnsupportedMediaType, ValidationError
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
)
from splinter.apps.media.utils import _file_ext, s3_client
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


class RetrieveMediaThumbnailView(APIView):
    def get(self, request, *args, **kwargs):
        attachment = get_object_or_404(
            MediaFile.objects.filter(content_type_fk__isnull=False),
            public_id=self.kwargs['media_uid'],
        )
        if not attachment.thumbnail_key:
            raise NotFound('Thumbnail not available.')

        bucket = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
        if not bucket:
            raise NotFound('Thumbnail not available.')

        s3_obj = s3_client().get_object(Bucket=bucket, Key=attachment.thumbnail_key)

        response = StreamingHttpResponse(
            s3_obj['Body'].iter_chunks(),
            content_type='image/jpeg',
        )
        response['Cache-Control'] = 'max-age=31536000, immutable'
        return response
