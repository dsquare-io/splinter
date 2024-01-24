from django.urls import include, path

from splinter.core.views import APIErrorView

urlpatterns = [
    path('', include('splinter.ext.health.urls')),
    path('', include('splinter.ext.swagger.urls')),
    path('api/friend/', include('splinter.apps.friend.urls')),
    path('api/mfa/', include('splinter.apps.mfa.urls')),
    path('api/user/', include('splinter.apps.user.urls')),
]

handler404 = APIErrorView.as_view(status=404)
handler500 = APIErrorView.as_view(status=500)
