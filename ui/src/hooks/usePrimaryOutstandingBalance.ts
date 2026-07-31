import { and, eq } from '@tanstack/db';
import { useLiveQuery } from '@tanstack/react-db';

import { AggregatedOutstandingBalance, BalanceScopeEnum } from '@/api-types/components/schemas';
import { outstandingBalances } from '@/collections/outstandingBalances.ts';
import { useCurrencyPreference } from '@/hooks/useCurrencyPreference.ts';
import { useEntitySync } from '@/hooks/useEntitySync.ts';

export function usePrimaryOutstandingBalance(
  scope: BalanceScopeEnum,
  objectUid: string
): { balance: AggregatedOutstandingBalance | undefined; hasSynced: boolean } {
  const { data: preferredCurrency } = useCurrencyPreference();
  const { hasSynced } = useEntitySync(outstandingBalances);

  const { data: balances } = useLiveQuery(
    (q) =>
      q
        .from({ balance: outstandingBalances.aggregated.collection })
        .where(({ balance }: any) => and(eq(balance.balanceScope, scope), eq(balance.objectUid, objectUid))),
    [scope, objectUid]
  );

  return {
    balance: balances.find((b) => b.currency === preferredCurrency) ?? balances[0],
    hasSynced,
  };
}
