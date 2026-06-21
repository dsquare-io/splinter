import os.path

from django.conf import settings
from django.contrib import admin
from django.http import Http404
from django.urls import include, path
from django.views.static import serve

from splinter.core.views import APIErrorView


def serve_ui(request, route=''):
    if route.startswith('api/'):
        raise Http404()

    route = os.path.normpath(route).lstrip('/')
    if os.path.isdir(os.path.join(settings.UI_ROOT, route)):
        route = os.path.join(route, 'index.html')

    try:
        return serve(request, route, document_root=settings.UI_ROOT)
    except Http404:
        if os.path.splitext(route)[1]:
            raise

        return serve(request, 'index.html', document_root=settings.UI_ROOT)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('splinter.core.health.urls')),
    path('api/', include('splinter.core.openapi.urls', namespace='openapi')),
    path('api/', include('splinter.apps.activity.urls')),
    path('api/', include('splinter.apps.authn.urls')),
    path('api/', include('splinter.apps.currency.urls')),
    path('api/', include('splinter.apps.expense.urls')),
    path('api/', include('splinter.apps.friend.urls')),
    path('api/', include('splinter.apps.group.urls')),
    path('api/', include('splinter.apps.mfa.urls')),
    path('api/', include('splinter.apps.notification.urls')),
    path('api/', include('splinter.apps.user.urls')),
]

if not settings.DEBUG:
    urlpatterns.extend(
        [
            path(f'{settings.STATIC_URL.strip('/')}/<path:path>', serve, {'document_root': settings.STATIC_ROOT}),
            path('', serve_ui),
            path('<path:route>', serve_ui),
        ]
    )

handler404 = APIErrorView.as_view(status=404)
handler500 = APIErrorView.as_view(status=500)
