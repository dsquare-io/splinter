from django.urls import path

from splinter.apps.authn import views

urlpatterns = [
    path('password', views.PasswordLoginView.as_view()),
    path('refresh', views.RefreshAccessTokenView.as_view()),
]
