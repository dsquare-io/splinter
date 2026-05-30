from django.urls import path

from splinter.apps.parsing import views

urlpatterns = [
    path('parsing', views.CreateParseView.as_view()),
    path('parsing/<uuid:parse_uid>', views.RetrieveParseView.as_view()),
]
