from splinter.apps.expense.balance import populate_friend_outstanding_balances
from splinter.apps.friend.models import Friendship
from splinter.apps.friend.serializers import CreateFriendshipSerializer, FriendWithOutstandingBalanceSerializer
from splinter.apps.user.shortcuts import invite_user
from splinter.core.views import CreateAPIView, ListAPIView, RetrieveAPIView


class ListCreateFriendView(ListAPIView, CreateAPIView):
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreateFriendshipSerializer

        return FriendWithOutstandingBalanceSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context

    def get_serializer(self, queryset=None, *args, **kwargs):
        if queryset:
            queryset = list(queryset)
            populate_friend_outstanding_balances(queryset, self.request.user)

        return super().get_serializer(queryset, *args, **kwargs)

    def get_queryset(self):
        return Friendship.objects.get_user_friends(self.request.user)

    def perform_create(self, serializer):
        user = serializer.save()

        if not user.is_active:
            invite_user(user, invited_by=self.request.user)


class RetrieveFriendView(RetrieveAPIView):
    serializer_class = FriendWithOutstandingBalanceSerializer

    lookup_field = 'username'

    def get_queryset(self):
        return Friendship.objects.get_user_friends(self.request.user)

    def get_object(self):
        friend = super().get_object()
        populate_friend_outstanding_balances([friend], self.request.user)
        return friend
