from rest_framework import serializers

from splinter.apps.expense.prefetch import AggregatedOutstandingBalancePrefetch, OutstandingBalancePrefetch
from splinter.apps.expense.serializers import AggregatedOutstandingBalanceSerializer, OutstandingBalanceSerializer
from splinter.apps.friend.models import Friendship
from splinter.apps.group.serializers import SimpleGroupSerializer
from splinter.apps.user.models import User
from splinter.apps.user.serializers import CreateUserSerializer, SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin


class FriendOutstandingBalanceSerializer(OutstandingBalanceSerializer):
    friend = SimpleUserSerializer(read_only=True)
    group = SimpleGroupSerializer(read_only=True)

    class Meta(OutstandingBalanceSerializer.Meta):
        fields = OutstandingBalanceSerializer.Meta.fields + ('group', 'friend')

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('group', 'friend')


class FriendSerializer(PrefetchQuerysetSerializerMixin, SimpleUserSerializer):
    outstanding_balances = FriendOutstandingBalanceSerializer(
        many=True, read_only=True, help_text='Outstanding balances for current user. Only top 5 on list view'
    )
    aggregated_outstanding_balance = AggregatedOutstandingBalanceSerializer(
        read_only=True, help_text='Aggregated outstanding balance for the current user'
    )

    class Meta(SimpleUserSerializer.Meta):
        fields = SimpleUserSerializer.Meta.fields + ('outstanding_balances', 'aggregated_outstanding_balance')

    def prefetch_queryset(self, queryset=None):
        outstanding_balance_qs = self.prefetch_nested_queryset('outstanding_balances').filter(
            user_id=self.context['request'].user.id
        )

        aggregated_outstanding_balance_qs = self.prefetch_nested_queryset('aggregated_outstanding_balance').filter(
            user_id=self.context['request'].user.id
        )

        return queryset.prefetch_related(
            OutstandingBalancePrefetch(
                'friend', queryset=outstanding_balance_qs, limit=self.context.get('outstanding_balance_limit')
            ),
            AggregatedOutstandingBalancePrefetch('friend', queryset=aggregated_outstanding_balance_qs),
        )


class CreateFriendshipSerializer(CreateUserSerializer):
    def validate_email(self, email: str):
        return User.objects.normalize_email(email)

    def validate(self, attrs):
        attrs = super().validate(attrs)

        user = User.objects.filter(email__iexact=attrs['email']).first()
        if user is not None:
            if user == self.context['request'].user:
                raise serializers.ValidationError({'email': 'You cannot add yourself as a friend'})

            if Friendship.objects.is_friend_with(self.context['request'].user, user):
                raise serializers.ValidationError({'email': f'You are already friends with {user.email}'})

        attrs['user'] = user
        return attrs

    def create(self, validated_data):
        user = validated_data.pop('user', None)
        if user is None:
            user = super().create(validated_data)

        Friendship.objects.create(user1=self.context['request'].user, user2=user)
        return user
