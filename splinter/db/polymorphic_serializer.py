from django.core.exceptions import ImproperlyConfigured
from rest_framework import serializers
from rest_framework.fields import empty


class PolymorphicSerializer(serializers.Field):
    def __init__(self, serializer_mapping: dict[type, serializers.Field]):
        super().__init__()
        self.serializer_mapping = serializer_mapping

        if len(self.serializer_mapping) < 2:
            raise ImproperlyConfigured('At-least 2 serializers are required')

    def to_internal_value(self, data):
        serializer = self.select_serializer(type(data))
        return serializer.to_internal_value(data)

    def run_validation(self, data=empty):
        serializer = self.select_serializer(type(data))
        return serializer.run_validation(data)

    def select_serializer(self, data_type: type):
        for dt, serializer in self.serializer_mapping.items():
            if issubclass(data_type, dt):
                return serializer

        dt_names = [dt.__name__ for dt in self.serializer_mapping]
        last_dt = dt_names.pop()

        expected_datatypes = '{} or {}'.format(', '.join(dt_names), last_dt)
        error_message = f'Invalid data. Expected a {expected_datatypes}, but got {data_type.__name__}.'
        raise serializers.ValidationError(error_message, code='invalid')
