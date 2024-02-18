from splinter.apps.expense.prefetch import AggregatedOutstandingBalancePrefetch, OutstandingBalancePrefetch
from splinter.apps.expense.serializers import AggregatedOutstandingBalanceSerializer, OutstandingBalanceSerializer
from splinter.apps.friend.models import Friendship
from splinter.apps.group.serializers import SimpleGroupSerializer
from splinter.apps.user.models import User
from splinter.apps.user.serializers import CreateUserSerializer, SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin


class FriendOutstandingBalanceSerializer(OutstandingBalanceSerializer):
    group = SimpleGroupSerializer(read_only=True)

    class Meta(OutstandingBalanceSerializer.Meta):
        fields = OutstandingBalanceSerializer.Meta.fields + ('group', )

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('group')


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
        outstanding_balance_qs = self.prefetch_nested_queryset('outstanding_balances') \
            .filter(user_id=self.context['request'].user.id)

        aggregated_outstanding_balance_qs = self.prefetch_nested_queryset('aggregated_outstanding_balance') \
            .filter(user_id=self.context['request'].user.id)

        return queryset.prefetch_related(
            OutstandingBalancePrefetch(
                'friend', queryset=outstanding_balance_qs, limit=self.context.get('outstanding_balance_limit')
            ),
            AggregatedOutstandingBalancePrefetch('friend', queryset=aggregated_outstanding_balance_qs),
        )


class CreateFriendshipSerializer(CreateUserSerializer):
    def validate_email(self, email: str):
        return User.objects.normalize_email(email)

    def create(self, validated_data):
        user = User.objects.filter(email__iexact=validated_data['email']).first()
        if user is None:
            user = super().create(validated_data)

        Friendship.objects.create(user_a_id=self.context['request'].user.id, user_b=user)
        return user
