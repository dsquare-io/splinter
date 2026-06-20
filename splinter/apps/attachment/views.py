import itertools

from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from splinter.apps.attachment.serializers import AttachmentConfigSerializer, CreateFileAttachmentSerializer
from splinter.core.views import APIView, CreateAPIView


class UploadFileAttachmentView(CreateAPIView):
    parser_classes = [MultiPartParser]
    serializer_class = CreateFileAttachmentSerializer

    VERBS_BY_METHOD = {
        'POST': {'Upload'},
    }


class RetrieveAttachmentConfigView(APIView):
    @extend_schema(responses={200: AttachmentConfigSerializer})
    def get(self, request, *args, **kwargs):
        mapping = settings.ATTACHMENT_ALLOWED_CONTENT_TYPE_EXTENSIONS
        return Response(
            {
                'max_file_size': settings.ATTACHMENT_MAX_FILE_SIZE,
                'allowed_content_types': list(mapping.keys()),
                'allowed_extensions': list(itertools.chain.from_iterable(mapping.values())),
            }
        )


class RetrieveAttachmentFileView(APIView):
    pass


class RetrieveAttachmentThumbnailView(APIView):
    pass
