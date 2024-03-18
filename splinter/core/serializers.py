from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers


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
        return str(obj)
