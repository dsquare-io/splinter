from django.urls import path

import splinter.apps.attachment.tasks  # NOQA
from splinter.apps.attachment import views

urlpatterns = [
    path('attachments', views.UploadFileAttachmentView.as_view()),
    path('attachments/config', views.RetrieveAttachmentConfigView.as_view()),
]
