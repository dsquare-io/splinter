import { and, eq } from '@tanstack/db';
import { useLiveQuery } from '@tanstack/react-db';

import { BalanceScopeEnum } from '@/api-types/components/schemas';
import { outstandingBalances } from '@/collections/outstandingBalances.ts';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Money } from '@/components/primitives';
import { useCurrencyPreference } from '@/hooks/useCurrencyPreference.ts';
import { useEntitySync } from '@/hooks/useEntitySync.ts';

type PrimaryBalanceSummaryProps = {
  scope: BalanceScopeEnum;
  objectUid: string;
};

export function PrimaryOutstandingBalance({ scope, objectUid }: PrimaryBalanceSummaryProps) {
  const { data: preferredCurrency } = useCurrencyPreference();
  const { hasSynced } = useEntitySync(outstandingBalances);

  const { data: balances } = useLiveQuery(
    (q) =>
      q
        .from({ balance: outstandingBalances.aggregated.collection })
        .where(({ balance }: any) => and(eq(balance.balanceScope, scope), eq(balance.objectUid, objectUid))),
    [scope, objectUid]
  );

  // A friend/group can have balances in multiple currencies now (server no longer collapses
  // to one) — show the preferred-currency entry if present, else the first available,
  // rather than silently hiding a real balance just because it's in another currency.
  const primaryBalance = balances.find((b) => b.currency === preferredCurrency) ?? balances[0];

  if (!hasSynced) {
    return (
      <div className="space-y-1.5 text-right">
        <Skeleton className="ml-auto h-2.5 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (!primaryBalance || +primaryBalance.amount === 0) {
    return <div className="text-xs text-gray-400">Settled up</div>;
  }

  return (
    <div className="text-right text-sm">
      <div className="text-xs text-gray-400">{+primaryBalance.amount > 0 ? 'You lent' : 'You borrowed'}</div>
      <Money
        currency={primaryBalance.currency}
        value={primaryBalance.amount}
      />
    </div>
  );
}
