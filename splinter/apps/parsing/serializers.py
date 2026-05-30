from rest_framework import serializers

from splinter.apps.parsing.models import ImageParse, Intent


class CreateParseSerializer(serializers.Serializer):
    media_uid = serializers.UUIDField()
    intent = serializers.ChoiceField(choices=Intent.choices)


class ImageParseSerializer(serializers.ModelSerializer):
    uid = serializers.UUIDField(source='public_id', read_only=True)

    class Meta:
        model = ImageParse
        fields = ('uid', 'intent', 'status', 'extracted_data', 'error')
