from django.utils.http import base36_to_int, int_to_base36
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from splinter.apps.authn.serializers import AuthTokenDataSerializer
from splinter.apps.authn.shortcuts import rotate_user_access_token
from splinter.apps.user import postman
from splinter.apps.user.models import EmailVerification, User
from splinter.apps.user.serializers import (
    ChangePasswordSerializer,
    CreateUserSerializer,
    EmailVerificationSerializer,
    ForgetPasswordSerializer,
    ResetPasswordSerializer,
    UserSerializer,
)
from splinter.apps.user.tokens import password_reset_token_generator
from splinter.authentication import UserAccessTokenAuthentication
from splinter.core.request_identity import RequestIdentity
from splinter.core.views import APIView, CreateAPIView, RetrieveAPIView, UpdateAPIView


class RetrieveUpdateProfileView(RetrieveAPIView, UpdateAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (UserAccessTokenAuthentication,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class CreateUserAccountView(CreateAPIView):
    permission_classes = ()
    serializer_class = CreateUserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        EmailVerification.objects.send_email(user)


class VerifyEmailView(APIView):
    permission_classes = ()
    serializer_class = EmailVerificationSerializer

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

        return {'uid': int_to_base36(user.id), 'token': password_reset_token_generator.make_token(user)}


class ChangePasswordView(APIView):
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, instance=self.request.user)
        serializer.is_valid(raise_exception=True)
        serializer.save()


class ForgetPasswordView(APIView):
    permission_classes = ()
    serializer_class = ForgetPasswordSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        request_identity = RequestIdentity.from_request(request)
        postman.send_password_reset_email(user, request_identity)


class ResetPasswordView(APIView):
    permission_classes = ()
    serializer_class = ResetPasswordSerializer

    @extend_schema(responses={200: AuthTokenDataSerializer})
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data
        try:
            user = User.objects.get(id=base36_to_int(validated_data['uid']))
        except (ValueError, User.DoesNotExist):
            raise ValidationError('Malfunctioned request', 'malfunctioned_request')

        if not password_reset_token_generator.check_token(user, validated_data['token']):
            raise ValidationError('Password reset token expired', 'password_reset_token_expired')

        user.set_password(validated_data['password'])
        user.is_active = True
        user.save()

        return rotate_user_access_token(user)
