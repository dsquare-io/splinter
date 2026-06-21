import itertools

from django.conf import settings
from django.http import FileResponse
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import NotFound
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from splinter.apps.attachment.authentication import AttachmentTokenAuthentication
from splinter.apps.attachment.models import AbstractAttachment
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


class GenericAttachmentView(APIView):
    authentication_classes = (AttachmentTokenAuthentication,)
    permission_classes = (IsAuthenticated,)

    @property
    def attachment(self) -> AbstractAttachment:
        return self.request.user  # NOQA

    def serve_file(self, file_field, content_type: str) -> FileResponse:
        response = FileResponse(file_field.open('rb'), content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{self.attachment.file_name}"'
        return response


class RetrieveAttachmentFileView(GenericAttachmentView):
    def get(self, request, *args, **kwargs):
        if self.attachment.processed_file:
            return self.serve_file(self.attachment.processed_file, 'image/webp')

        return self.serve_file(self.attachment.file, self.attachment.content_type)


class RetrieveAttachmentThumbnailView(GenericAttachmentView):
    def get(self, request, *args, **kwargs):
        if not self.attachment.thumbnail:
            raise NotFound('Thumbnail not available.')

        return self.serve_file(self.attachment.thumbnail, 'image/webp')
