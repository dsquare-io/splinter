import { currencyPreference } from '@/collections/currencyPreference.ts';
import { useEntitySync } from '@/hooks/useEntitySync.ts';
import { useLocalValue } from '@/hooks/useLocalValue.ts';

export function useCurrencyPreference() {
  const data = useLocalValue(currencyPreference.store);
  const { isSyncing, error } = useEntitySync(currencyPreference);

  return { data, isPending: !data && isSyncing, error };
}
