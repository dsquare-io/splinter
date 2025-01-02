from rest_framework import serializers

from splinter.apps.media.models import Media
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin


class MediaSerializer(PrefetchQuerysetSerializerMixin, serializers.ModelSerializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)
    urn = serializers.CharField(read_only=True)
    url = serializers.URLField(read_only=True)

    class Meta:
        model = Media
        fields = ('uid', 'urn', 'url', 'original_filename', 'file_size', 'mime_type', 'uploaded_at')
        read_only_fields = ('original_filename', 'file_size', 'mime_type', 'uploaded_at')


class MediaUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)
    
    class Meta:
        model = Media
        fields = ('file',)

    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("User must be authenticated")

        # Get the content type and object ID from the URL
        content_type = self.context.get('content_type')
        object_id = self.context.get('object_id')
        
        if not content_type or not object_id:
            raise serializers.ValidationError("Content type and object ID are required")

        return Media.objects.create(
            file=validated_data['file'],
            content_type=content_type,
            object_id=object_id,
            uploaded_by=request.user
        )