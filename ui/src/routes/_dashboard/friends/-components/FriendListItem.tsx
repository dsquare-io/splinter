import clx from 'clsx';

import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';
import { Link } from '@tanstack/react-router';

import { AggregatedOutstandingBalance, OutstandingBalance } from '@/api-types/components/schemas';
import { FriendIdentity } from '@/collections/friendsCollection.ts';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Avatar, Money } from '@/components/primitives';
import { OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';
import { useCurrencyPreference } from '@/hooks/useCurrencyPreference.ts';

type FriendListItemProps = FriendIdentity & {
  aggregatedOutstandingBalances: AggregatedOutstandingBalance[];
  outstandingBalances: OutstandingBalance[];
  balancesLoading: boolean;
};

export function FriendListItem({
  name,
  uid,
  isActive,
  aggregatedOutstandingBalances,
  outstandingBalances,
  balancesLoading,
}: FriendListItemProps) {
  const { data: preferredCurrency } = useCurrencyPreference();

  // A friend can have balances in multiple currencies now (server no longer collapses
  // to one) — show the preferred-currency entry if present, else the first available,
  // rather than silently hiding a real balance just because it's in another currency.
  const primaryBalance =
    aggregatedOutstandingBalances.find((b) => b.currency === preferredCurrency?.uid) ??
    aggregatedOutstandingBalances[0];

  return (
    <Link
      to="/friends/$friend"
      params={{ friend: uid }}
      className={clx(
        'data-status:bg-brand-50 relative block w-full px-6 py-4 hover:bg-gray-100',
        'border-y border-gray-200',
        '[&.active]:border-brand-200 [&.active]:z-10',
        outstandingBalances.length == 0 ? 'item-center' : 'items-start'
      )}
    >
      <div className="flex items-center gap-x-3">
        {isActive ? (
          <Avatar
            className="size-9"
            fallback={name}
          />
        ) : (
          <div className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-sm text-amber-400 ring-1 ring-amber-200">
            <ExclamationTriangleIcon className="size-4 text-amber-400" />
          </div>
        )}
        <div className="text-md flex flex-1 items-center gap-2 py-1">{name}</div>
        {balancesLoading ? (
          <div className="space-y-1.5 text-right">
            <Skeleton className="ml-auto h-2.5 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : !primaryBalance || +primaryBalance.amount === 0 ? (
          <div className="text-xs text-gray-400">Settled up</div>
        ) : (
          <div className="text-right text-sm">
            <div className="text-xs text-gray-400">
              {+primaryBalance.amount > 0 ? 'You lent' : 'You borrowed'}
            </div>
            <Money
              currency={primaryBalance.currency}
              value={primaryBalance.amount}
            />
          </div>
        )}
      </div>

      {!!outstandingBalances.length && (
        <div className="grow pt-1 pl-12 text-sm font-medium text-gray-800">
          <OutstandingBalanceList
            balances={outstandingBalances}
            resolveFriend={() => ({ uid, urn: '', name, isActive })}
          />
        </div>
      )}
    </Link>
  );
}
