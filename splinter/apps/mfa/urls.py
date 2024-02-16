from django.urls import path

from splinter.apps.mfa import views

urlpatterns = [
    path('mfa/devices', views.ListMfaDeviceView.as_view()),
    path('mfa/static', views.ListMfaStaticCodeView.as_view()),
    path('mfa/device/<str:device_type>:<int:id>', views.DestroyMfaDeviceView.as_view()),
    path('mfa/challenge/<str:device_type>', views.ChallengeMfaDeviceView.as_view()),
    path('mfa/verify/<str:device_type>', views.VerifyMfaDeviceView.as_view()),
    path('mfa/enable/<str:device_type>', views.EnableMfaDeviceView.as_view()),
    path('mfa/confirm/<str:device_type>', views.ConfirmMfaDeviceView.as_view()),
]
