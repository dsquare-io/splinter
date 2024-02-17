from splinter.apps.expense.prefetch import AggregatedOutstandingBalancePrefetch, OutstandingBalancePrefetch
from splinter.apps.expense.serializers import AggregatedOutstandingBalanceSerializer, OutstandingBalanceSerializer
from splinter.apps.friend.models import Friendship
from splinter.apps.group.serializers import SimpleGroupSerializer
from splinter.apps.user.models import User
from splinter.apps.user.serializers import CreateUserSerializer, UserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin


class FriendOutstandingBalanceSerializer(OutstandingBalanceSerializer):
    group = SimpleGroupSerializer(read_only=True)

    class Meta(OutstandingBalanceSerializer.Meta):
        fields = OutstandingBalanceSerializer.Meta.fields + ('group', )

    def prefetch_queryset(self, queryset=None):
        return super().prefetch_queryset(queryset).prefetch_related('group')


class FriendSerializer(PrefetchQuerysetSerializerMixin, UserSerializer):
    outstanding_balances = FriendOutstandingBalanceSerializer(many=True, read_only=True)
    aggregated_outstanding_balance = AggregatedOutstandingBalanceSerializer(read_only=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ('outstanding_balances', 'aggregated_outstanding_balance')

    def prefetch_queryset(self, queryset=None):
        outstanding_balance_qs = self.prefetch_nested_queryset('outstanding_balances') \
            .filter(user_id=self.context['request'].user.id)

        aggregated_outstanding_balance_qs = self.prefetch_nested_queryset('aggregated_outstanding_balance') \
            .filter(user_id=self.context['request'].user.id)

        return queryset.prefetch_related(
            OutstandingBalancePrefetch('user', queryset=outstanding_balance_qs, limit=3),
            AggregatedOutstandingBalancePrefetch('user', queryset=aggregated_outstanding_balance_qs),
        )


class CreateFriendshipSerializer(CreateUserSerializer):
    def validate_email(self, email: str):
        return User.objects.normalize_email(email)

    def create(self, validated_data):
        user = User.objects.filter(email__iexact=validated_data['email']).first()
        if user is None:
            user = super().create(validated_data)

        Friendship.objects.create(user_a=self.context['user'], user_b=user)
        return user
