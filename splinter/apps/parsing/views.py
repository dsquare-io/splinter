from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import APIException, NotFound, ValidationError
from rest_framework.response import Response

from splinter.apps.media.models import MediaFile
from splinter.apps.parsing.models import ImageParse
from splinter.apps.parsing.serializers import CreateParseSerializer, ImageParseSerializer
from splinter.apps.parsing.tasks import parse_media_file
from splinter.core.views import APIView, RetrieveAPIView


class ParsingNotConfigured(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Image parsing is not configured.'
    default_code = 'parsing_not_configured'


class CreateParseView(APIView):
    @extend_schema(request=CreateParseSerializer, responses={201: ImageParseSerializer})
    def post(self, request, *args, **kwargs):
        if not settings.IMAGE_PARSER_MODEL:
            raise ParsingNotConfigured()

        serializer = CreateParseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        media_uid = serializer.validated_data['media_uid']
        intent = serializer.validated_data['intent']

        # Owner-only: a file owned by another user is indistinguishable from a
        # missing one.
        media_file = MediaFile.objects.filter(public_id=media_uid, uploaded_by=request.user).first()
        if media_file is None:
            raise NotFound('Media file not found.')

        if not media_file.content_type.startswith('image/'):
            raise ValidationError('Only image media can be parsed.')

        parse = ImageParse.objects.create(
            media_file=media_file,
            intent=intent,
            provider=settings.IMAGE_PARSER_MODEL,
        )
        parse_media_file.delay(parse.pk)

        return Response(ImageParseSerializer(parse).data, status=status.HTTP_201_CREATED)


class RetrieveParseView(RetrieveAPIView):
    serializer_class = ImageParseSerializer
    lookup_field = 'public_id'
    lookup_url_kwarg = 'parse_uid'

    def get_queryset(self):
        return ImageParse.objects.filter(media_file__uploaded_by=self.request.user)
