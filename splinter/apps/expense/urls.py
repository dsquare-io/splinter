from django.urls import path

import splinter.apps.expense.signals  # NOQA: Init the signals
from splinter.apps.expense import views

urlpatterns = [
    path('friends/<str:friend_uid>/expenses', views.ListFriendExpenseView.as_view()),
    path('groups/<uuid:group_uid>/expenses', views.ListGroupExpenseView.as_view()),
    path('user/outstanding-balance', views.RetrieveUserOutstandingBalanceView.as_view()),
]
