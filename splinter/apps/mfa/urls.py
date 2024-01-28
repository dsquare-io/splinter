from django.urls import path

from splinter.apps.mfa import views

urlpatterns = [
    path('devices', views.ListMfaDeviceView.as_view()),
    path('static', views.ListMfaStaticCodeView.as_view()),
    path('device/<str:device>:<int:id>', views.DestroyMfaDeviceView.as_view()),
    path('challenge/<str:device>', views.ChallengeMfaDeviceView.as_view()),
    path('verify/<str:device>', views.VerifyMfaDeviceView.as_view()),
    path('enable/<str:device>', views.EnableMfaDeviceView.as_view()),
    path('confirm/<str:device>', views.ConfirmMfaDeviceView.as_view()),
]
