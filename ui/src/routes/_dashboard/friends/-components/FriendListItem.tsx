import clx from 'clsx';

import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';
import { Link } from '@tanstack/react-router';

import { Friend } from '@/api-types/components/schemas';
import { Avatar, Money } from '@/components/primitives';
import { OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';

export function FriendListItem({
  name,
  uid,
  isActive,
  aggregatedOutstandingBalance,
  outstandingBalances,
}: Friend) {
  return (
    <Link
      to="/friends/$friend"
      params={{ friend: uid }}
      className={clx(
        'data-status:bg-brand-50 relative block w-full px-6 py-4 hover:bg-gray-100',
        'border-y border-gray-200',
        '[&.active]:border-brand-200 [&.active]:z-10',
        outstandingBalances?.length == 0 ? 'item-center' : 'items-start'
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
        {+aggregatedOutstandingBalance.amount === 0 ? (
          <div className="text-xs text-gray-400">Settled up</div>
        ) : (
          <div className="text-right text-sm">
            <div className="text-xs text-gray-400">
              {+aggregatedOutstandingBalance.amount > 0 ? 'You lent' : 'You borrowed'}
            </div>
            <Money
              currency={aggregatedOutstandingBalance.currency}
              value={aggregatedOutstandingBalance.amount}
            />
          </div>
        )}
      </div>

      {!!outstandingBalances?.length && (
        <div className="grow pt-1 pl-12 text-sm font-medium text-gray-800">
          <OutstandingBalanceList balances={outstandingBalances} />
        </div>
      )}
    </Link>
  );
}
