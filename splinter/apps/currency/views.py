from rest_framework.generics import ListAPIView

from splinter.apps.currency.models import Currency
from splinter.apps.currency.serializers import CurrencySerializer
from splinter.core.views import GenericAPIView


class ListCurrencyView(ListAPIView, GenericAPIView):
    pagination_class = None
    permission_classes = ()
    authentication_classes = ()
    serializer_class = CurrencySerializer

    def get_queryset(self):
        return Currency.objects.order_by('iso_code').all()
