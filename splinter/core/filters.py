from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Case, F, Value, When
from rest_framework.filters import BaseFilterBackend


class TrigramSimilaritySearchBackend(BaseFilterBackend):
    query_param_name = 'q'

    def get_search_fields(self, view, queryset):
        return getattr(queryset.model, 'SEARCH_FIELDS', None) or getattr(view, 'search_fields', None)

    def get_search_query(self, request):
        params = request.GET.get(self.query_param_name, '')
        params = params.replace('\x00', '')  # strip null characters
        return params

    def filter_queryset(self, request, queryset, view):
        query = self.get_search_query(request)
        search_fields = self.get_search_fields(view, queryset)
        if not search_fields or not query:
            return queryset

        cases = []
        for field in search_fields:
            cases.append(
                When(**{f'{field}__trigram_similar': query}, then=25 * (1 - TrigramSimilarity(F(field), query)))
            )

        queryset = queryset.annotate(search_rank=Case(*cases, default=Value(0.0)))
        return queryset.filter(search_rank__gt=0).order_by('-search_rank')

    def get_schema_operation_parameters(self, view):
        return [
            {
                'name': self.query_param_name,
                'required': False,
                'in': 'query',
                'description': 'Search Query',
                'schema': {
                    'type': 'string',
                },
            },
        ]
