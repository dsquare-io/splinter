from django.urls import path

from splinter.apps.group import views

urlpatterns = [
    path('all', views.ListCreateGroupView.as_view()),
    path('members', views.BulkCreateGroupMemberView.as_view()),
    path('<group>', views.RetrieveUpdateGroupView.as_view()),
    path('<group>/<member>', views.DestroyGroupMembershipView.as_view()),
]
