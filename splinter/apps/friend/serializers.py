from drf_yasg.utils import swagger_serializer_method
from rest_framework import serializers

from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from splinter.apps.user.serializers import CreateUserSerializer


class FriendOutstandingBalanceSerializer(serializers.Serializer):
    group = serializers.DictField(child=serializers.DecimalField(max_digits=9, decimal_places=2))
    non_group = serializers.DictField(child=serializers.DecimalField(max_digits=9, decimal_places=2))


class FriendSerializer(serializers.ModelSerializer):
    uid = serializers.ReadOnlyField(source='username')
    name = serializers.ReadOnlyField(source='display_name')
    invitation_accepted = serializers.ReadOnlyField(source='is_active')

    class Meta:
        model = User
        fields = ('uid', 'name', 'invitation_accepted')


class FriendDetailSerializer(FriendSerializer):
    outstanding_balances = serializers.SerializerMethodField()
    aggregated_outstanding_balances = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('uid', 'name', 'invitation_accepted', 'outstanding_balances', 'aggregated_outstanding_balances')

    @swagger_serializer_method(FriendOutstandingBalanceSerializer)
    def get_outstanding_balances(self, instance):
        return getattr(instance, 'outstanding_balances', {})

    @swagger_serializer_method(serializers.DictField(child=serializers.DecimalField(max_digits=9, decimal_places=2)))
    def get_aggregated_outstanding_balances(self, instance):
        aggregated = {}

        outstanding_balances = getattr(instance, 'outstanding_balances', {})
        group = outstanding_balances.get('group', {})
        non_group = outstanding_balances.get('non_group', {})

        for currency in set(group.keys()) | set(non_group.keys()):
            aggregated[currency] = group.get(currency, 0) + non_group.get(currency, 0)

        return aggregated


class InviteFriendSerializer(CreateUserSerializer):
    default_error_messages = {
        'email_collision': 'A user with with given email is already in your friend list',
    }

    class Meta:
        model = User
        fields = ('name', 'email', 'user_role')

    def validate_email(self, email: str):
        existing = Friendship.objects.filter(source=self.context['user'], target__email__iexact=email).first()
        if existing is not None:
            raise serializers.ValidationError(self.error_messages['email_collision'], code='email_collision')

        return email

    def create(self, validated_data):
        validated_data['password'] = User.objects.make_random_password()
        validated_data['is_active'] = False

        user = User.objects.filter(email__iexact=validated_data['email']).first()
        if user is None:
            user = super().create(validated_data)

        Friendship.objects.create(
            source=self.context['user'],
            target=user,
        )
        return user
