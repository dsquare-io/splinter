from django.urls import path

from splinter.apps.media import views

urlpatterns = [
    path('files/presigned-url', views.PresignedUploadUrlView.as_view()),
    path('files', views.RegisterFileView.as_view()),
]
