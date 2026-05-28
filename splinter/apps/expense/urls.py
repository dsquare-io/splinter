from django.urls import path

import splinter.apps.expense.orchestrator  # NOQA: Init Orchestrator
from splinter.apps.expense import views

urlpatterns = [
    path('expenses', views.CreateExpenseView.as_view()),
    path('payments', views.CreatePaymentView.as_view()),
    path('payments/<uuid:payment_uid>', views.UpdatePaymentView.as_view()),
    path('expenses/<uuid:expense_uid>', views.RetrieveUpdateDestroyRestoreExpenseView.as_view()),
    path('expenses/<uuid:expense_uid>/changelog', views.RetrieveExpenseChangeLogView.as_view()),
    # Attachments
    path(
        'expenses/<uuid:expense_uid>/attachments/<uuid:attachment_uid>/url',
        views.RetrieveExpenseAttachmentUrlView.as_view(),
    ),
    # Friend/Group Expense
    path('friends/<str:friend_uid>/expenses', views.ListFriendExpenseView.as_view()),
    path('groups/<uuid:group_uid>/expenses', views.ListGroupExpenseView.as_view()),
    # User
    path('user/outstanding-balance', views.RetrieveUserOutstandingBalanceView.as_view()),
]
