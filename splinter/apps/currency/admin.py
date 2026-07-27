from django.contrib import admin

from splinter.apps.currency.models import ConversionRate, Country, Currency, UserCurrency


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'flag')


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('code', 'symbol', 'is_active')


@admin.register(ConversionRate)
class ConversionRateAdmin(admin.ModelAdmin):
    list_display = ('source', 'target', 'rate')

    def get_queryset(self, request):
        return super().get_queryset(request).order_by('source', 'target', '-as_of').distinct('source', 'target')

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(UserCurrency)
class UserCurrencyAdmin(admin.ModelAdmin):
    list_display = ('user', 'currency')
    search_fields = ('user__username', 'user__email')
    list_filter = ('currency',)
