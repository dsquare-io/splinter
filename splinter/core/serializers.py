from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from splinter.utils.strings import public_string


class ObjectSerializer(serializers.Serializer):
    uid = serializers.SerializerMethodField(read_only=True, allow_null=True)
    urn = serializers.SerializerMethodField(allow_null=True)

    value = serializers.SerializerMethodField('get_obj_value')

    @extend_schema_field(serializers.CharField(help_text='Unique identifier of object'))
    def get_uid(self, obj):
        uid_field = getattr(obj, 'UID_FIELD', None)
        if uid_field:
            return getattr(obj, uid_field, None)

    @extend_schema_field(serializers.CharField(help_text='Unique resource name of object'))
    def get_urn(self, obj):
        try:
            return getattr(obj, 'urn')
        except NotImplementedError:
            pass

    @extend_schema_field(serializers.CharField(help_text='String representation of object'))
    def get_obj_value(self, obj) -> str:
        return public_string(obj)


class PolymorphicSerializer(serializers.Serializer):
    discriminator_field = 'type'

    serializer_mapping = {}

    def get_serializer_class(self, discriminator: str) -> type[serializers.Serializer]:
        return self.serializer_mapping[discriminator]

    def get_serializer(self, discriminator: str, **kwargs) -> serializers.Serializer:
        serializer_class = self.get_serializer_class(discriminator)
        kwargs['context'] = self.context
        return serializer_class(**kwargs)

    def get_fields(self):
        return {
            self.discriminator_field: serializers.CharField(),
        }

    def get_discriminator(self, instance) -> str:
        raise NotImplementedError()

    def to_representation(self, value):
        discriminator = self.get_discriminator(value)
        serialized = self.get_serializer(discriminator, instance=value).to_representation(value)
        serialized[self.discriminator_field] = discriminator
        return serialized

    def to_internal_value(self, data):
        discriminator = super().to_internal_value(data)[self.discriminator_field]

        serializer = self.get_serializer(discriminator, data=data).data
        setattr(self, '_serializer', serializer)

        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    def save(self, **kwargs):
        assert hasattr(self, '_errors'), 'You must call `.is_valid()` before calling `.save()`.'

        assert not self.errors, 'You cannot call `.save()` on a serializer with invalid data.'

        assert not hasattr(self, '_data'), (
            "You cannot call `.save()` after accessing `serializer.data`."
            "If you need to access data before committing to the database then "
            "inspect 'serializer.validated_data' instead. "
        )

        return getattr(self, '_serializer').save(**kwargs)
