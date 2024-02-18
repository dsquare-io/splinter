from rest_framework.serializers import ListSerializer


class PrefetchQuerysetSerializerMixin:
    def prefetch_queryset(self, queryset=None):
        if queryset is None:
            if not hasattr(self, 'Meta') or not hasattr(self.Meta, 'model'):
                raise ValueError('queryset is required if Meta.model is not defined')

            queryset = self.Meta.model.objects.all()

        return queryset

    def prefetch_nested_queryset(self, field_name: str, queryset=None):
        serializer = self.fields[field_name]
        if serializer is None:
            raise ValueError(f'Field {field_name} is not defined')

        if isinstance(serializer, ListSerializer):
            serializer = serializer.child

        if not hasattr(serializer, 'prefetch_queryset'):
            raise ValueError(f'Field {field_name} does not support prefetching')

        return serializer.prefetch_queryset(queryset)
