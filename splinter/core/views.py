from django.http.response import HttpResponseBase
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.generics import GenericAPIView as DrfGenericAPIView
from rest_framework.response import Response
from rest_framework.views import APIView as DrfAPIView

from splinter.authentication import UserAccessTokenAuthentication
from splinter.core.mixins import (
    CreateModelMixin,
    DestroyModelMixin,
    ListModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
)
from splinter.core.permissions import IsVerified


class APIView(DrfAPIView):
    authentication_classes = (UserAccessTokenAuthentication, )
    permission_classes = (IsVerified, )

    def handle_exception(self, exc):
        if isinstance(exc, APIException):
            return Response(exc.get_full_details(), status=exc.status_code)

        return super().handle_exception(exc)

    def finalize_response(self, request, response, *args, **kwargs):
        if response is None:
            response = Response(status=status.HTTP_204_NO_CONTENT)
        elif not isinstance(response, HttpResponseBase):
            response = Response(response)

        return super().finalize_response(request, response, *args, **kwargs)


class APIErrorView(APIView):
    status: int = 500
    description: str = None
    authentication_classes = ()
    permission_classes = ()

    def get(self, *args, **kwargs):
        return Response(self.description, status=self.status)


class GenericAPIView(APIView, DrfGenericAPIView):
    def prefetch_queryset(self, queryset):
        serializer = self.get_serializer()
        if hasattr(serializer, 'prefetch_queryset'):
            return serializer.prefetch_queryset(queryset)

        return queryset

    def filter_queryset(self, queryset):
        if self.request.method == 'GET':
            queryset = self.prefetch_queryset(queryset)

        return super().filter_queryset(queryset)


class ListAPIView(ListModelMixin, GenericAPIView):
    def get(self, *args, **kwargs):
        return self.list(*args, **kwargs)


class CreateAPIView(CreateModelMixin, GenericAPIView):
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class RetrieveAPIView(RetrieveModelMixin, GenericAPIView):
    def get(self, *args, **kwargs):
        return self.retrieve(*args, **kwargs)


class DestroyAPIView(DestroyModelMixin, GenericAPIView):
    def delete(self, *args, **kwargs):
        return self.destroy(*args, **kwargs)


class UpdateAPIView(UpdateModelMixin, GenericAPIView):
    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
