from django.http.response import HttpResponseBase
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.generics import GenericAPIView as DrfGenericAPIView
from rest_framework.mixins import DestroyModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.response import Response
from rest_framework.views import APIView as DrfAPIView

from splinter.core.authentication import UserAccessTokenAuthentication
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
    pass


class ListAPIView(ListModelMixin, GenericAPIView):
    def get(self, *args, **kwargs):
        return self.list(*args, **kwargs)


class RetrieveAPIView(RetrieveModelMixin, GenericAPIView):
    def get(self, *args, **kwargs):
        return self.retrieve(*args, **kwargs)


class DestroyAPIView(DestroyModelMixin, GenericAPIView):
    def get_serializer(self, *args, **kwargs):
        if self.request.method == 'DELETE':
            return None

        return super().get_serializer(*args, **kwargs)

    def delete(self, *args, **kwargs):
        return self.destroy(*args, **kwargs)


class CreateAPIView(GenericAPIView):
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save()


class UpdateAPIView(GenericAPIView):
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

    def put(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
