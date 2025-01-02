from rest_framework import status
from rest_framework.mixins import DestroyModelMixin as DrfDestroyModelMixin
from rest_framework.mixins import ListModelMixin as DrfListModelMixin
from rest_framework.mixins import RetrieveModelMixin as DrfRetrieveModelMixin
from rest_framework.response import Response

from splinter.core.serializers import ObjectSerializer


class ListModelMixin(DrfListModelMixin):
    pass


class CreateModelMixin:
    create_response_serializer_class = ObjectSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        data = self.create_response_serializer_class(instance=serializer.instance).data
        return Response(data, status=status.HTTP_201_CREATED)

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

class ProfilePictureMixin:
    def update_profile_picture(self, media_file):
        """Update profile picture and handle old picture cleanup"""
        if self.profile_picture:
            old_picture = self.profile_picture
            self.profile_picture = None
            self.save()
            old_picture.delete()
        
        self.profile_picture = media_file
        self.save()
