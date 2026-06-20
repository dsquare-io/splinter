import os

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

STATIC_URL = '/static/'

FILE_UPLOAD_HANDLERS = (
    'django.core.files.uploadhandler.MemoryFileUploadHandler',
    'django.core.files.uploadhandler.TemporaryFileUploadHandler',
)

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
}

AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')


def configure_static(settings):
    settings['UI_ROOT'] = os.path.join(settings['BASE_DIR'], 'ui')
    settings['STATIC_ROOT'] = os.path.join(settings['BASE_DIR'], 'static')
    settings['MEDIA_ROOT'] = os.path.join(settings['BASE_DIR'], 'media')

    if AWS_STORAGE_BUCKET_NAME:
        settings['STORAGES']['default'] = {
            "BACKEND": 'storages.backends.s3boto3.S3Boto3Storage',
            "OPTIONS": {
                "endpoint_url": os.getenv('AWS_S3_ENDPOINT_URL'),
                "bucket_name": AWS_STORAGE_BUCKET_NAME,
            },
        }
