from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django.utils.functional import cached_property
from rest_framework.generics import get_object_or_404

from splinter.apps.activity.models import Activity, ActivityAudience, Comment
from splinter.apps.activity.serializers import ActivitySerializer, CommentSerializer
from splinter.core.pagination import CursorPagination
from splinter.core.views import CreateAPIView, DestroyAPIView, GenericAPIView, ListAPIView, RetrieveAPIView
from splinter.db.urn import ResourceName


class ListActivityView(ListAPIView):
    serializer_class = ActivitySerializer
    pagination_class = CursorPagination

    def get_ordering(self, request):
        return ('created_at',) if request.GET.get('order') == 'asc' else ('-created_at',)

    def paginate_queryset(self, queryset):
        page = super().paginate_queryset(queryset)
        activity_ids = {a.activity_id for a in page}
        ActivityAudience.objects.filter(
            user=self.request.user, activity_id__in=activity_ids, delivered_at__isnull=True
        ).update(delivered_at=timezone.now())
        return page

    def get_queryset(self):
        qs = ActivityAudience.objects.filter(user=self.request.user)

        object_urn = ResourceName.try_parse(self.request.GET.get('of'))
        if object_urn:
            try:
                instance = object_urn.get_instance()
            except ObjectDoesNotExist:
                return qs.none()

            qs = qs.filter(
                activity__object_content_type=ContentType.objects.get_for_model(instance),
                activity__object_id=instance.id,
            )

        return qs


class RetrieveActivityView(RetrieveAPIView):
    serializer_class = ActivitySerializer

    def get_object(self):
        audience = get_object_or_404(
            ActivityAudience, user=self.request.user, activity__public_id=self.kwargs['activity_uid']
        )

        if audience.read_at is None:
            audience.read_at = timezone.now()
            audience.save(update_fields=['read_at'])

        return audience


class GenericActivityView(GenericAPIView):
    @cached_property
    def activity(self):
        return get_object_or_404(Activity, public_id=self.kwargs['activity_uid'])


class ListCreateCommentView(ListAPIView, CreateAPIView, GenericActivityView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.filter(activity=self.activity).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(activity=self.activity, user_id=self.request.user.id)


class DestroyCommentView(DestroyAPIView, GenericActivityView):
    lookup_field = 'public_id'
    lookup_url_kwarg = 'comment_uid'

    def get_queryset(self):
        return Comment.objects.filter(activity=self.activity)
