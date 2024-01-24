from django.urls import path

from splinter.ext.health import views

urlpatterns = [
    path('liveness', views.liveness),
    path('readiness', views.readiness),
]
