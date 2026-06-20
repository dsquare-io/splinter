from django.urls import path

from splinter.apps.attachment import views

urlpatterns = [
    path('attachments', views.RetrieveAttachmentFileView.as_view()),
    path('attachments/<uuid:attachment_uid>/thumbnail', views.RetrieveAttachmentThumbnailView.as_view()),
]
