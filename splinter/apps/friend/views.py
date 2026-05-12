from django.conf import settings
from rest_framework.exceptions import ValidationError

from splinter.apps.expense.models import OutstandingBalance
from splinter.apps.friend.models import Friendship
from splinter.apps.friend.serializers import CreateFriendshipSerializer, FriendSerializer
from splinter.apps.user.models import UserInvitation
from splinter.core.filters import TrigramSimilaritySearchBackend
from splinter.core.serializers import EmptySerializer
from splinter.core.views import CreateAPIView, GenericAPIView, ListAPIView, RetrieveAPIView


class ListCreateFriendView(ListAPIView, CreateAPIView):
    filter_backends = [TrigramSimilaritySearchBackend]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateFriendshipSerializer

        return FriendSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['outstanding_balance_limit'] = settings.EXPENSE_AGGREGATED_OUTSTANDING_BALANCE_LIMIT
        return context

    def get_queryset(self):
        return Friendship.objects.get_user_friends(self.request.user)

    def perform_create(self, serializer):
        user = serializer.save()

        if not user.is_active:
            UserInvitation.objects.invite(invitee=user, inviter=self.request.user)


class GenericFriendView(GenericAPIView):
    lookup_field = 'username'
    lookup_url_kwarg = 'friend_uid'

    def get_queryset(self):
        return Friendship.objects.get_user_friends(self.request.user)


class RetrieveDestroyFriendView(RetrieveAPIView, GenericFriendView):
    serializer_class = FriendSerializer

    def delete(self, request, *args, **kwargs):
        friend = self.get_object()
        if OutstandingBalance.objects.filter(user=request.user, friend=friend).exists():
            raise ValidationError('Cannot delete friend with outstanding balance')

        Friendship.objects.of(request.user, friend).delete()


class CreateFriendInvitationView(GenericFriendView):
    serializer_class = EmptySerializer

    def post(self, request, *args, **kwargs):
        friend = self.get_object()
        if friend.is_active:
            raise ValidationError('User is already active')

        UserInvitation.objects.invite(invitee=friend, inviter=request.user)
