import { useQuery } from '@tanstack/react-query';

import { ApiRoutes } from '@/api-types';
import { apiQueryOptions } from '@/hooks/useApiQuery.ts';

export function currencyPreferenceQueryOptions() {
  return apiQueryOptions(ApiRoutes.CURRENCY_PREFERENCE, undefined, undefined, {
    meta: { persist: true },
    gcTime: Infinity, // paired with a finite persistOptions.maxAge — see queryPersister.ts
    staleTime: 5 * 60_000,
    // Never let a transient/background refetch failure regress an already-known-good value back to blank.
    placeholderData: (prev) => prev,
  });
}

export function useCurrencyPreference() {
  return useQuery(currencyPreferenceQueryOptions());
}
