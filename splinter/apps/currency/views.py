from splinter.apps.currency.models import Currency
from splinter.apps.currency.serializers import CurrencySerializer
from splinter.core.views import ListAPIView


class ListCurrencyView(ListAPIView):
    pagination_class = None
    permission_classes = ()
    authentication_classes = ()
    serializer_class = CurrencySerializer

    def get_queryset(self):
        return Currency.objects.order_by('code').first(is_active=True)
