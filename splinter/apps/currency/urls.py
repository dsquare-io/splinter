from django.urls import path

from splinter.apps.currency import views

urlpatterns = [
    path('all', views.ListCurrencyView.as_view()),
]
