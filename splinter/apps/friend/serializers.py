from django.conf import settings
from rest_framework import serializers

from splinter.apps.friend.models import Friendship
from splinter.apps.user.models import User
from splinter.apps.user.serializers import CreateUserSerializer, SimpleUserSerializer
from splinter.core.prefetch import PrefetchQuerysetSerializerMixin


class FriendSerializer(PrefetchQuerysetSerializerMixin, SimpleUserSerializer):
    class Meta(SimpleUserSerializer.Meta):
        fields = SimpleUserSerializer.Meta.fields + ('email',)


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

        if (
            Friendship.objects.get_user_friends(self.context['request'].user).count()
            >= settings.FRIEND_MAX_ALLOWED_FRIENDS
        ):
            raise serializers.ValidationError({'email': 'You have reached the maximum number of friends'})

        attrs['user'] = user
        return attrs

    def create(self, validated_data):
        user = validated_data.pop('user', None)
        if user is None:
            user = super().create(validated_data)

        Friendship.objects.create(user1=self.context['request'].user, user2=user)
        return user
