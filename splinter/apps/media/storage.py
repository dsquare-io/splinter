from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage


class PrivateS3Boto3Storage(S3Boto3Storage):
    default_acl = 'private'
    querystring_auth = True
    querystring_expire = 900

    def url(self, name, parameters=None, expire=None, http_method=None):
        url = super().url(name, parameters=parameters, expire=expire, http_method=http_method)
        internal = getattr(settings, 'AWS_S3_ENDPOINT_URL', None)
        public = getattr(settings, 'AWS_S3_PRESIGNED_ENDPOINT_URL', None)
        if internal and public and internal != public and url.startswith(internal):
            url = public + url[len(internal):]
        return url
