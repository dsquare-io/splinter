from django.urls import path

from splinter.apps.friend import views

urlpatterns = [
    path('all', views.ListFiendView.as_view()),
    path('invite', views.InviteFiendView.as_view()),
]
