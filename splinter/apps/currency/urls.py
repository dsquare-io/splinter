from django.urls import path

from splinter.apps.currency import views

urlpatterns = [
    path('currencies', views.ListCurrencyView.as_view()),
    path('user/currency', views.RetrieveUpdateCurrencyPreferenceView.as_view()),
]
