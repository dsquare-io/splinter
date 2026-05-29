import os

import boto3
from django.conf import settings


def _file_ext(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext.lower()


def s3_client():
    return boto3.client(
        's3',
        region_name=settings.AWS_S3_REGION_NAME,
        endpoint_url=getattr(settings, 'AWS_S3_ENDPOINT_URL', None),
    )
