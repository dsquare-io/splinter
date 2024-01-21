from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import base36_to_int, int_to_base36
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from splinter.apps.token.models import AccessToken
from splinter.apps.token.serializers import AccessTokenSerializer
from splinter.apps.token.shortcuts import generate_user_access_token
from splinter.apps.user import postman
from splinter.apps.user.models import EmailVerification, User
from splinter.apps.user.request_identity import RequestIdentity
from splinter.apps.user.serializers import (
    AuthenticateUserSerializer,
    ChangePasswordSerializer,
    EmailVerificationSerializer,
    ForgetPasswordSerializer,
    RegisterUserSerializer,
    ResetPasswordSerializer,
    UserProfileSerializer,
)
from splinter.core.authentication import UserAccessTokenAuthentication
from splinter.core.views import APIView, CreateAPIViewEx, GenericAPIView, UpdateAPIViewEx


class AuthenticateUserView(GenericAPIView):
    serializer_class = AuthenticateUserSerializer
    permission_classes = ()

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        access_token = generate_user_access_token(user)
        return AccessTokenSerializer(instance=access_token).data


class UserProfileView(UpdateAPIViewEx, GenericAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (UserAccessTokenAuthentication, )
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def get(self, request):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return serializer.data


class CreateAccountView(CreateAPIViewEx, GenericAPIView):
    permission_classes = ()
    serializer_class = RegisterUserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        EmailVerification.objects.send_email(user)


class EmailVerificationView(APIView):
    permission_classes = ()
    serializer_class = EmailVerificationSerializer
    token_generator = default_token_generator

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        verification_token = serializer.validated_data['token']
        email_verification = EmailVerification.objects.filter(verification_token=verification_token).first()
        if email_verification is None:
            raise ValidationError('Invalid email verification token.', code='email_verification_invalid_token')

        user = User.objects.get(email=email_verification.email)
        user.is_verified = True
        user.save(update_fields=['is_verified', 'updated_at'])
        if not email_verification.verify():
            raise ValidationError('Email verification token expired', code='email_verification_token_expired')

        return {'uid': int_to_base36(user.id), 'token': self.token_generator.make_token(user)}


class ChangePasswordView(APIView):
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, instance=self.request.user)
        serializer.is_valid(raise_exception=True)
        serializer.save()


class ForgetPasswordView(APIView):
    permission_classes = ()
    serializer_class = ForgetPasswordSerializer
    token_generator = default_token_generator

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        uid = int_to_base36(user.id)
        recovery_token = self.token_generator.make_token(user)
        password_reset_url = f'{settings.PUBLIC_URL}/reset?uid={uid}&token={recovery_token}'

        request_identity = RequestIdentity.from_request(request)
        postman.send_password_reset_email(user, password_reset_url, request_identity)


class ResetPasswordView(APIView):
    permission_classes = ()
    serializer_class = ResetPasswordSerializer
    token_generator = default_token_generator

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        try:
            user = User.objects.get(id=base36_to_int(validated_data['uid']))
        except (ValueError, User.DoesNotExist):
            raise ValidationError('Malfunctioned request', 'malfunctioned_request')

        if not self.token_generator.check_token(user, validated_data['token']):
            raise ValidationError('Password reset token expired', 'password_reset_token_expired')

        user.set_password(validated_data['password'])
        user.is_active = True
        user.save()

        access_token = generate_user_access_token(user)
        return AccessTokenSerializer(instance=access_token).data


class LogoutView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request):
        auth = request.auth
        if isinstance(auth, AccessToken):
            auth.delete()
