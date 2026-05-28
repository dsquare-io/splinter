from django.urls import path

from splinter.apps.media import views

urlpatterns = [
    path('media/upload', views.PresignedUploadUrlView.as_view()),
    path('media/<uuid:media_uid>/url', views.RetrieveMediaUrlView.as_view()),
]
