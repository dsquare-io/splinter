from django.urls import path

from splinter.apps.mfa import views

urlpatterns = [
    path('devices', views.ListMfaDeviceView.as_view()),
    path('static', views.ListMfaStaticCodeView.as_view()),
    path('device/<slug>:<id>', views.DeleteMfaDeviceView.as_view()),
    path('challenge/<slug>', views.ChallengeMfaDeviceView.as_view()),
    path('verify/<slug>', views.VerifyMfaDeviceView.as_view()),
    path('enable/<slug>', views.EnableMfaDeviceView.as_view()),
    path('confirm/<slug>', views.ConfirmMfaDeviceView.as_view()),
]
