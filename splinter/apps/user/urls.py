from django.conf import settings
from django.urls import path

from splinter.apps.user import views

urlpatterns = [
    path('user/profile', views.RetrieveUpdateProfileView.as_view()),
    path('user/password', views.ChangePasswordView.as_view()),
    path('user/forget', views.ForgetPasswordView.as_view()),
    path('user/reset', views.ResetPasswordView.as_view()),
    path('user/verify-email', views.VerifyEmailView.as_view()),
    path('user/profile-picture', views.UpdateUserProfilePictureView.as_view()),
]

if settings.SIGNUP_ENABLED:
    urlpatterns.append(path('user/account', views.CreateUserAccountView.as_view()))
