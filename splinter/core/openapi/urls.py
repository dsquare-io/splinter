from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

import splinter.core.openapi.extesions  # NOQA: Initialize extensions

app_name = 'openai'
urlpatterns = [
    path('swagger/', SpectacularSwaggerView.as_view(url_name='openapi:schema')),
    path('api/schema', SpectacularAPIView.as_view(), name='schema'),
]
