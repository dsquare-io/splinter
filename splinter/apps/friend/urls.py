from django.urls import path

from splinter.apps.friend import views

urlpatterns = [
    path('friends', views.ListCreateFriendView.as_view()),
    path('friends/<str:friend_uid>', views.RetrieveFriendView.as_view()),
]
