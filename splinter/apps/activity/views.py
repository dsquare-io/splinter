from django.utils.functional import cached_property
from rest_framework.generics import get_object_or_404

from splinter.apps.activity.models import Activity, Comment
from splinter.apps.activity.serializers import ActivitySerializer, CommentSerializer
from splinter.core.views import CreateAPIView, DestroyAPIView, GenericAPIView, ListAPIView


class ListActivityView(ListAPIView):
    serializer_class = ActivitySerializer

    def get_queryset(self):
        return Activity.objects.of(self.request.user.id)\
            .prefetch_related('user', 'group', 'target')\
            .order_by('-created_at')


class GenericActivityView(GenericAPIView):
    @cached_property
    def activity(self):
        return get_object_or_404(Activity, public_id=self.kwargs['activity_uid'])


class ListCreateCommentView(ListAPIView, CreateAPIView, GenericActivityView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(activity=self.activity).prefetch_related('user').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(activity=self.activity, user_id=self.request.user.id)


class DestroyCommentView(DestroyAPIView, GenericActivityView):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'comment_uid'

    def get_queryset(self):
        return Comment.objects.filter(activity=self.activity)
