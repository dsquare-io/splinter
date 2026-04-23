import clx from 'clsx';

import { Link } from '@tanstack/react-router';

import { Friend } from '@/api-types/components/schemas';
import Currency from '@/components/Currency.tsx';
import { OutstandingBalanceList } from '@/components/OutstandingBalanceList.tsx';
import { Avatar } from '@/components/common';

export default function FriendListItem({
  fullName,
  uid,
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
        <Avatar
          className="size-9"
          fallback={fullName}
        />
        <div className="text-md flex-1 py-1">{fullName}</div>
        {+(aggregatedOutstandingBalance?.amount ?? '0') === 0 ? (
          <div className="text-xs text-gray-400">Settled up</div>
        ) : (
          <div className="text-right text-sm">
            <div className="text-xs text-gray-400">
              {+(aggregatedOutstandingBalance?.amount ?? '0') > 0 ? 'You lent' : 'You borrowed'}
            </div>
            <Currency
              currency={aggregatedOutstandingBalance?.currency.uid ?? ''}
              value={aggregatedOutstandingBalance?.amount ?? 0}
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
