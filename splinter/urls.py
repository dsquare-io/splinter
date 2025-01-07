import os.path

from django.conf import settings
from django.urls import include, path
from django.views.static import serve

from splinter.core.views import APIErrorView


def serve_ui(request, path):
    path = os.path.normpath(path).lstrip('/')
    if os.path.isdir(os.path.join(settings.UI_ROOT, path)):
        path = os.path.join(path, 'index.html')

    return serve(request, path, document_root=settings.UI_ROOT)


urlpatterns = [
    path('', include('splinter.core.health.urls')),
    path('', include('splinter.core.openapi.urls', namespace='openapi')),
    path('api/', include('splinter.apps.activity.urls')),
    path('api/', include('splinter.apps.authn.urls')),
    path('api/', include('splinter.apps.currency.urls')),
    path('api/', include('splinter.apps.expense.urls')),
    path('api/', include('splinter.apps.friend.urls')),
    path('api/', include('splinter.apps.group.urls')),
    path('api/', include('splinter.apps.mfa.urls')),
    path('api/', include('splinter.apps.user.urls')),
]

if not settings.DEBUG:
    urlpatterns.extend([
        path('', serve_ui, {'path': ''}),
        path('<path:path>', serve_ui),
    ])

handler404 = APIErrorView.as_view(status=404)
handler500 = APIErrorView.as_view(status=500)
