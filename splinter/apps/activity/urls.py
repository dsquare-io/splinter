from django.urls import path

from splinter.apps.activity import views

urlpatterns = [
    path('activities', views.ListActivityView.as_view()),
    path('activities/<uuid:activity_uid>/comments', views.ListCreateCommentView.as_view()),
    path('activities/<uuid:activity_uid>/comments/<uuid:comment_uid>', views.DestroyCommentView.as_view()),
]
