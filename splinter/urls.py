from django.urls import include, path

from splinter.core.views import APIErrorView

urlpatterns = [
    path('', include('splinter.core.health.urls')),
    path('', include('splinter.core.openapi.urls', namespace='openapi')),
    path('api/authn/', include('splinter.apps.authn.urls')),
    path('api/currency/', include('splinter.apps.currency.urls')),
    path('api/expense/', include('splinter.apps.expense.urls')),
    path('api/friend/', include('splinter.apps.friend.urls')),
    path('api/group/', include('splinter.apps.group.urls')),
    path('api/mfa/', include('splinter.apps.mfa.urls')),
    path('api/user/', include('splinter.apps.user.urls')),
]

handler404 = APIErrorView.as_view(status=404)
handler500 = APIErrorView.as_view(status=500)
