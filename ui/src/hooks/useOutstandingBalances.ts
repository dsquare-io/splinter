import { eq } from '@tanstack/db';
import { useLiveQuery } from '@tanstack/react-db';

import { BalanceScopeEnum, OutstandingBalance } from '@/api-types/components/schemas';
import { outstandingBalances } from '@/collections/outstandingBalances.ts';

export function useOutstandingBalances(scope: BalanceScopeEnum, objectUid: string): OutstandingBalance[] {
  const { data } = useLiveQuery(
    (q) =>
      q
        .from({ balance: outstandingBalances.raw.collection })
        .where(({ balance }) => eq(scope === 'group' ? balance.groupUid : balance.friendUid, objectUid)),
    [scope, objectUid]
  );

  return [...data].sort((a, b) => Math.abs(+b.amount) - Math.abs(+a.amount));
}
