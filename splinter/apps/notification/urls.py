from django.urls import path

import splinter.apps.notification.receivers  # NOQA
from splinter.apps.notification import views

urlpatterns = [
    path('notifications/vapid-key', views.RetrieveVapidPublicKeyView.as_view()),
    path('notifications/push-subscriptions', views.CreatePushSubscriptionView.as_view()),
    path('notifications/push-subscriptions/<uuid:subscription_uid>', views.DestroyTestPushSubscriptionView.as_view()),
]
