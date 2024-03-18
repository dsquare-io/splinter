from django.urls import path

from splinter.apps.group import views

urlpatterns = [
    path('groups', views.ListCreateGroupView.as_view()),
    path('groups/<uuid:group_uid>', views.RetrieveUpdateDestroyGroupView.as_view()),
    path('groups/<uuid:group_uid>/members', views.SyncGroupMembershipView.as_view()),
    path('groups/<uuid:group_uid>/members/<str:member_uid>', views.DestroyGroupMembershipView.as_view()),
]
