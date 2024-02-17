from django.urls import path

from splinter.apps.authn import views

urlpatterns = [
    path('authn/password', views.PasswordLoginView.as_view()),
    path('authn/refresh', views.RefreshAccessTokenView.as_view()),
]
