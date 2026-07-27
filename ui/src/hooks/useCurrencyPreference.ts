import { useQuery, type DefinedUseQueryResult, type QueryClient } from '@tanstack/react-query';

import { ApiRoutes } from '@/api-types';
import { apiQueryKey, persistApiQueryOptions } from '@/hooks/useApiQuery.ts';

export function useCurrencyPreference(): DefinedUseQueryResult<NoInfer<string>, Error> {
  return useQuery({
    ...persistApiQueryOptions(ApiRoutes.CURRENCY_PREFERENCE),
    select: (currency) => currency.uid,
  });
}

export function invalidateCurrencyPreference(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: apiQueryKey(ApiRoutes.CURRENCY_PREFERENCE) });
}
