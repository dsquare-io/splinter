from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from rest_framework import serializers

from splinter.apps.user.models import User
from splinter.apps.user.utils import suggest_username


class AuthenticateUserSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=64, trim_whitespace=False, required=True, min_length=1)
    password = serializers.CharField(max_length=64, trim_whitespace=False, required=True, min_length=1)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(request=self.context.get('request'), username=email, password=password)

        # The authenticate call simply returns None for is_active=False
        # users. (Assuming the default ModelBackend authentication
        # backend.)
        if not user:
            msg = 'Invalid email/username or password.'
            raise serializers.ValidationError(msg, code='invalid_credentials')

        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'display_name', 'first_name', 'last_name', 'email', 'is_verified')
        read_only_fields = ('display_name', 'is_verified')


class EmailVerificationSerializer(serializers.Serializer):
    token = serializers.CharField(required=True, max_length=64)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, max_length=64)
    password = serializers.CharField(required=True, max_length=64)

    default_error_messages = {'invalid_old_password': 'Old password is invalid'}

    def validate_old_password(self, password):
        if not check_password(password, self.instance.password):
            raise serializers.ValidationError(self.error_messages['invalid_old_password'])

        return password

    def update(self, instance, validated_data):
        instance.set_password(validated_data['password'])
        instance.save()
        return instance


class ForgetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    default_error_messages = {'invalid_email': 'Provided email is not associated with any profile.'}

    def validate_email(self, email):
        existing_user = User.objects.filter(email__iexact=email).first()
        if existing_user is None:
            raise serializers.ValidationError(self.error_messages['invalid_email'])

        return existing_user

    def create(self, validated_data):
        return validated_data['email']


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=True, max_length=64)


class CreateUserSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    name = serializers.CharField(required=True, max_length=128)
    default_error_messages = {
        'email_collision': 'A user with with given email already exists.',
    }

    def validate_email(self, email):
        existing_user = User.objects.filter(email__iexact=email).first()
        if existing_user is not None:
            raise serializers.ValidationError(self.error_messages['email_collision'], code='email_collision')

        return email

    def validate(self, attrs):
        names = attrs.pop('name').split(' ', 1)
        last_name = ''
        if len(names) == 1:
            first_name, = names
        else:
            first_name, last_name = names

        attrs['first_name'] = first_name
        attrs['last_name'] = last_name
        return attrs

    def create(self, validated_data):
        if 'username' not in validated_data:
            validated_data['username'] = suggest_username(validated_data['email'])

        validated_data.setdefault('is_active', False)
        return User.objects.create_user(**validated_data)


class RegisterUserSerializer(CreateUserSerializer):
    pass
