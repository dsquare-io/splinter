from rest_framework import status
from rest_framework.mixins import DestroyModelMixin as DrfDestroyModelMixin
from rest_framework.mixins import ListModelMixin as DrfListModelMixin
from rest_framework.mixins import RetrieveModelMixin as DrfRetrieveModelMixin
from rest_framework.response import Response


class ListModelMixin(DrfListModelMixin):
    pass


class CreateModelMixin:
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save()


class RetrieveModelMixin(DrfRetrieveModelMixin):
    pass


class UpdateModelMixin:
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class DestroyModelMixin(DrfDestroyModelMixin):
    def get_serializer(self, *args, **kwargs):
        if self.request.method == 'DELETE':
            return None

        return super().get_serializer(*args, **kwargs)
