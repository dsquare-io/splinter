from django.urls import path

from splinter.apps.group import views

urlpatterns = [
    path('groups', views.ListCreateGroupView.as_view()),
    path('groups/<uuid:group_uid>', views.RetrieveUpdateGroupView.as_view()),
    path('groups/<uuid:group_uid>/members', views.SyncGroupMembershipView.as_view()),
]
