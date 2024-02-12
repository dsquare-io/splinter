from django.urls import path

from splinter.apps.activity import views

urlpatterns = [
    path('all', views.ListActivityView.as_view()),
    path('<uuid:activity_uid>/comments', views.ListCreateCommentView.as_view()),
    path('<uuid:activity_uid>/comments/<uuid:comment_uid>', views.DestroyCommentView.as_view()),
]
