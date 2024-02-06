from django.conf import settings
from django.urls import path

from splinter.apps.user import views

urlpatterns = [
    path('profile', views.RetrieveUpdateProfileView.as_view()),
    path('password', views.ChangePasswordView.as_view()),
    path('forget', views.ForgetPasswordView.as_view()),
    path('reset', views.ResetPasswordView.as_view()),
    path('verify-email', views.VerifyEmailView.as_view()),
]

if settings.SIGNUP_ENABLED:
    urlpatterns.append(path('account', views.CreateUserAccountView.as_view()))
