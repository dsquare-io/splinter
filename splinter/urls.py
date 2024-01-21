from django.urls import include, path

from splinter.core import health
from splinter.core.views import APIErrorView

urlpatterns = [
    path('liveness', health.liveness),
    path('readiness', health.readiness),
    path('/api/mfa/', include('splinter.apps.mfa.urls')),
]

handler404 = APIErrorView.as_view(status=404)
handler500 = APIErrorView.as_view(status=500)
