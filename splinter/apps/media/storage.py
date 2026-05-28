from storages.backends.s3boto3 import S3Boto3Storage


class PrivateS3Boto3Storage(S3Boto3Storage):
    default_acl = 'private'
    querystring_auth = True
    querystring_expire = 900
