from splinter.apps.currency.models import Currency, UserCurrency
from splinter.apps.currency.serializers import CurrencySerializer, UserCurrencySerializer
from splinter.core.mixins import UpdateModelMixin
from splinter.core.views import ListAPIView, RetrieveAPIView


class ListCurrencyView(ListAPIView):
    pagination_class = None
    permission_classes = ()
    authentication_classes = ()
    serializer_class = CurrencySerializer

    def get_queryset(self):
        return Currency.objects.order_by('code').filter(is_active=True)


class RetrieveUpdateCurrencyPreferenceView(UpdateModelMixin, RetrieveAPIView):
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return CurrencySerializer

        return UserCurrencySerializer

    def get_object(self):
        user_currency = UserCurrency.objects.of(user=self.request.user)
        if self.request.method == 'GET':
            return user_currency.currency

        return user_currency

    def put(self, *args, **kwargs):
        return self.update(*args, **kwargs)
