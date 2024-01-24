from rest_framework import serializers

from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from splinter.apps.user.serializers import CreateUserSerializer


class FriendSerializer(serializers.ModelSerializer):
    uid = serializers.ReadOnlyField(source='username')
    name = serializers.ReadOnlyField(source='display_name')

    class Meta:
        model = User
        fields = ('uid', 'name', 'is_active')


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
