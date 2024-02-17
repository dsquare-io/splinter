from django.urls import include, path

from splinter.core.views import APIErrorView

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

handler404 = APIErrorView.as_view(status=404)
handler500 = APIErrorView.as_view(status=500)
