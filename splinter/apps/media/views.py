import secrets

import boto3
from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from splinter.apps.media.models import MediaFile
from splinter.apps.media.serializers import (
    MediaUrlSerializer,
    PresignedUrlRequestSerializer,
    PresignedUrlResponseSerializer,
    _file_ext,
)
from splinter.core.views import APIView


class PresignedUploadUrlView(APIView):
    @extend_schema(request=PresignedUrlRequestSerializer, responses={200: PresignedUrlResponseSerializer})
    def post(self, request, *args, **kwargs):
        serializer = PresignedUrlRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        alias = secrets.token_hex(16)
        ext = _file_ext(data['filename'])
        key = f'uploads/{alias}{ext}'

        client = boto3.client(
            's3',
            region_name=settings.AWS_S3_REGION_NAME,
            endpoint_url=getattr(settings, 'AWS_S3_PRESIGNED_ENDPOINT_URL', None),
        )
        presigned = client.generate_presigned_post(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=key,
            Fields={'Content-Type': data['content_type']},
            Conditions=[
                ['content-length-range', 1, data['file_size']],
                {'Content-Type': data['content_type']},
            ],
            ExpiresIn=300,
        )
        return Response({**presigned, 'alias': alias})


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
