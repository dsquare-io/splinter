from rest_framework.generics import ListAPIView

from splinter.apps.expense.balance import populate_friend_outstanding_balances
from splinter.apps.friend.serializers import FriendDetailSerializer, InviteFriendSerializer
from splinter.apps.friend.shortcuts import get_user_friends
from splinter.apps.user.shortcuts import invite_user
from splinter.core.views import GenericAPIView


class ListFiendView(ListAPIView, GenericAPIView):
    serializer_class = FriendDetailSerializer

    def get_serializer(self, queryset=None, *args, **kwargs):
        if queryset:
            queryset = list(queryset)
            populate_friend_outstanding_balances(queryset, self.request.user)

        return super().get_serializer(queryset, *args, **kwargs)

    def get_queryset(self):
        return get_user_friends(self.request.user.id)


class InviteFiendView(GenericAPIView):
    serializer_class = InviteFriendSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context

    def post(self, request, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if not user.is_active:
            invite_user(user, invited_by=self.request.user)
