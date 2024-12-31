from django.urls import path

from splinter.apps.media import views

urlpatterns = [
    path('<str:model_type>/<int:model_id>/upload', views.UploadMediaView.as_view()),
    path('<uuid:media_uid>', views.DeleteMediaView.as_view()),
]