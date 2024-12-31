from django.contrib.contenttypes.models import ContentType
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser

from splinter.apps.media.models import Media
from splinter.apps.media.serializers import MediaSerializer, MediaUploadSerializer
from splinter.core.views import CreateAPIView, DestroyAPIView


class UploadMediaView(CreateAPIView):
    serializer_class = MediaUploadSerializer
    parser_classes = (MultiPartParser,)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        
        # Get model type and ID from URL parameters
        model_type = self.kwargs.get('model_type')
        model_id = self.kwargs.get('model_id')
        
        try:
            content_type = ContentType.objects.get(model=model_type)
        except ContentType.DoesNotExist:
            raise ValidationError(f"Invalid model type: {model_type}")

        # Verify the object exists
        try:
            content_type.get_object_for_this_type(id=model_id)
        except content_type.model_class().DoesNotExist:
            raise ValidationError(f"No {model_type} found with ID {model_id}")

        context['content_type'] = content_type
        context['object_id'] = model_id
        return context


class DeleteMediaView(DestroyAPIView):
    queryset = Media.objects.all()
    lookup_field = 'public_id'
    lookup_url_kwarg = 'media_uid'

    def get_queryset(self):
        return super().get_queryset().filter(uploaded_by=self.request.user)