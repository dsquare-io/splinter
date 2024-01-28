from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

import splinter.ext.openapi.extesions  # NOQA: Initialize extensions

app_name = 'splinter'
urlpatterns = [
    path('swagger/', SpectacularSwaggerView.as_view(url_name='openapi:schema')),
    path('api/schema', SpectacularAPIView.as_view(), name='schema'),
]
