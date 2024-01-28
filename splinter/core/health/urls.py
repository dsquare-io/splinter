from django.urls import path

from splinter.core.health import views

urlpatterns = [
    path('liveness', views.liveness),
    path('readiness', views.readiness),
]
