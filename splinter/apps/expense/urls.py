from django.urls import path

import splinter.apps.expense.signals  # NOQA: Init the signals
from splinter.apps.expense import views

urlpatterns = [
    path('friends/<str:username>/expenses', views.ListFriendExpenseView.as_view()),
    path('groups/<uuid:group_id>/expenses', views.ListGroupExpenseView.as_view()),
]
