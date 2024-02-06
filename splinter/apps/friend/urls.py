from django.urls import path

from splinter.apps.friend import views

urlpatterns = [
    path('all', views.ListCreateFriendView.as_view()),
    path('<str:username>', views.RetrieveFriendView.as_view()),
]
