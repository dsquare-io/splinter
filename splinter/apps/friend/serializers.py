from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from splinter.apps.expense.fields import OutstandingBalanceSerializerField
from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from splinter.apps.user.serializers import CreateUserSerializer, UserSerializer


class FriendOutstandingBalanceSerializer(serializers.Serializer):
    group = OutstandingBalanceSerializerField()
    non_group = OutstandingBalanceSerializerField()


class FriendWithOutstandingBalanceSerializer(UserSerializer):
    outstanding_balances = serializers.SerializerMethodField()
    aggregated_outstanding_balances = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = UserSerializer.Meta.fields + ('outstanding_balances', 'aggregated_outstanding_balances')

    @extend_schema_field(FriendOutstandingBalanceSerializer)
    def get_outstanding_balances(self, instance):
        return getattr(instance, 'outstanding_balances', {})

    @extend_schema_field(OutstandingBalanceSerializerField)
    def get_aggregated_outstanding_balances(self, instance):
        aggregated = {}

        outstanding_balances = getattr(instance, 'outstanding_balances', {})
        group = outstanding_balances.get('group', {})
        non_group = outstanding_balances.get('non_group', {})

        for currency in set(group.keys()) | set(non_group.keys()):
            aggregated[currency] = group.get(currency, 0) + non_group.get(currency, 0)

        return aggregated


class CreateFriendshipSerializer(CreateUserSerializer):
    def validate_email(self, email: str):
        return User.objects.normalize_email(email)

    def create(self, validated_data):
        user = User.objects.filter(email__iexact=validated_data['email']).first()
        if user is None:
            user = super().create(validated_data)

        Friendship.objects.create(user_a=self.context['user'], user_b=user)
        return user
