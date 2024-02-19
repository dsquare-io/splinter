import clx from 'clsx';
import {Fragment} from 'react';

import Currency from '@components/Currency.tsx';
import {Avatar} from '@components/common/Avatar.tsx';
import {Link} from '@tanstack/react-router';

import {Friend} from '@/api-types/components/schemas';

export default function FriendListItem({
  fullName,
  uid,
  aggregatedOutstandingBalance,
  outstandingBalances,
}: Friend) {
  return (
    <Link
      to="/friends/$friend"
      params={{friend: uid}}
      className={clx(
        'relative flex gap-x-3 px-6 py-4 hover:bg-gray-100 data-[status]:bg-brand-50',
        'border-y border-gray-200',
        '[&.active]:z-10 [&.active]:border-brand-200',
        outstandingBalances?.length == 0 ? 'item-center' : 'items-start'
      )}
    >
      <Avatar
        className="size-10"
        fallback={fullName}
      />
      <div className="grow text-sm font-medium text-gray-800">
        <div className="text-md py-1">{fullName}</div>
        <div className="mt-1.5 space-y-1 text-xs font-normal text-gray-400">
          {outstandingBalances?.slice(0, 3).map((e) => (
            <Fragment key={e.group?.uid ?? e.currency.uid}>
              <p>
                {+e.amount > 0 && <>{fullName} borrowed </>}
                {+e.amount < 0 && <>You lent </>}
                <Currency
                  currency={e.currency.uid}
                  value={e.amount}
                />
                {e.group && <> in {e.group.name}</>}
              </p>
            </Fragment>
          ))}
          {(outstandingBalances?.length ?? 0) > 3 && (
            <p className="text font-light text-gray-400">and {(outstandingBalances?.length ?? 0) - 3} more</p>
          )}
        </div>
      </div>
      {+(aggregatedOutstandingBalance?.amount ?? '0') === 0 ? (
        <div className="text-xs text-gray-400">Settled up</div>
      ) : (
        <div className="absolute right-6 top-3 text-right text-sm">
          <div className="text-xs text-gray-400">
            {+(aggregatedOutstandingBalance?.amount ?? '0') > 0 ? 'You lent' : 'You borrowed'}
          </div>
          <Currency
            currency="PKR"
            value={aggregatedOutstandingBalance?.amount ?? 0}
          />
        </div>
      )}
    </Link>
  );
}
