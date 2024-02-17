from django.urls import path

from splinter.apps.currency import views

urlpatterns = [
    path('currencies', views.ListCurrencyView.as_view()),
]
