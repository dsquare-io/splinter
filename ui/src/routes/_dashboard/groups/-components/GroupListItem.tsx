import clx from 'clsx';

import { useLiveQuery } from '@tanstack/react-db';
import { Link } from '@tanstack/react-router';

import {
  AggregatedOutstandingBalance,
  OutstandingBalance,
  SimpleGroup,
} from '@/api-types/components/schemas';
import { friendsCollection } from '@/collections/friendsCollection.ts';
import { Avatar, Money } from '@/components/primitives';
import { OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';
import { useCurrencyPreference } from '@/hooks/useCurrencyPreference.ts';

type GroupListItemProps = SimpleGroup & {
  aggregatedOutstandingBalances: AggregatedOutstandingBalance[];
  outstandingBalances: OutstandingBalance[];
  balancesLoading: boolean;
};

export function GroupListItem({
  uid,
  name,
  aggregatedOutstandingBalances,
  outstandingBalances,
  balancesLoading,
}: GroupListItemProps) {
  const { data: preferredCurrency } = useCurrencyPreference();
  // GROUP_LIST doesn't include members, so name resolution for the breakdown is
  // best-effort against the friends collection only — a counterparty who isn't already
  // a friend falls back to a generic label in OutstandingBalanceList.
  const { data: friends } = useLiveQuery((q) => q.from({ friend: friendsCollection }));

  const primaryBalance =
    aggregatedOutstandingBalances.find((b) => b.currency === preferredCurrency) ??
    aggregatedOutstandingBalances[0];

  return (
    <Link
      to="/groups/$group"
      params={{ group: uid }}
      className={clx(
        'data-status:bg-brand-50 relative block px-6 py-4 hover:bg-gray-100',
        'border-y border-gray-200',
        '[&.active]:border-brand-200 [&.active]:z-10',
        outstandingBalances.length == 0 ? 'item-center' : 'items-start'
      )}
    >
      <div className="flex items-center gap-x-3">
        <Avatar
          className="size-9 rounded-lg"
          fallback={name}
        />
        <div className="text-md flex-1 py-1">{name}</div>
        {balancesLoading ? null : !primaryBalance || +primaryBalance.amount === 0 ? (
          <div className="text-xs text-gray-400">Settled up</div>
        ) : (
          <div className="-mt-1 text-right text-sm">
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
      <div className="grow pt-1 pl-12 text-sm font-medium text-gray-800">
        <div className="mt-1.5 space-y-1 text-xs font-normal text-gray-400">
          <OutstandingBalanceList
            balances={outstandingBalances}
            resolveFriend={(friendUid) => friends.find((f) => f.uid === friendUid)}
          />
        </div>
      </div>
    </Link>
  );
}
