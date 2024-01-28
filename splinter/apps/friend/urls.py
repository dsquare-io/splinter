from django.urls import path

from splinter.apps.friend import views

urlpatterns = [
    path('all', views.ListFriendView.as_view()),
    path('invite', views.InviteFriendView.as_view()),
]
