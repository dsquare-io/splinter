from django.urls import path

from splinter.apps.group import views

urlpatterns = [
    path('all', views.ListCreateGroupView.as_view()),
    path('members', views.BulkCreateGroupMembershipView.as_view()),
    path('<uuid:group_uid>', views.RetrieveUpdateGroupView.as_view()),
    path('<uuid:group_uid>/members/<str:member_uid>', views.DestroyGroupMembershipView.as_view()),
]
