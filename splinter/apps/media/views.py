import secrets

import boto3
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response

from splinter.apps.media.serializers import (
    MediaFileSerializer,
    PresignedUrlRequestSerializer,
    RegisterFileSerializer,
    _file_ext,
)
from splinter.core.views import APIView


class PresignedUploadUrlView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = PresignedUrlRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        alias = secrets.token_hex(16)
        ext = _file_ext(data['filename'])
        key = f'uploads/{alias}{ext}'

        client = boto3.client('s3', region_name=settings.AWS_S3_REGION_NAME)
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


class RegisterFileView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = RegisterFileSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        media_file = serializer.save()
        return Response(MediaFileSerializer(media_file).data, status=status.HTTP_201_CREATED)
