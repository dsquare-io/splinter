from django.urls import path

from splinter.apps.group import views

urlpatterns = [
    path('all', views.ListCreateGroupView.as_view()),
    path('members', views.BulkCreateGroupMembershipView.as_view()),
    path('<uuid:group>', views.RetrieveUpdateGroupView.as_view()),
    path('<uuid:group>/members/<str:member>', views.DestroyGroupMembershipView.as_view()),
]
