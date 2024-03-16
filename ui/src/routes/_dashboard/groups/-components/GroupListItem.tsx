import clx from 'clsx';
import {Fragment} from 'react';

import {Link} from '@tanstack/react-router';

import {Group} from '@/api-types/components/schemas';
import Currency from '@/components/Currency.tsx';
import {Avatar} from '@/components/common';

export default function GroupListItem({uid, name, outstandingBalances, aggregatedOutstandingBalance}: Group) {
  return (
    <Link
      to="/groups/$group"
      params={{group: uid!}}
      className={clx(
        'relative block px-6 py-4 hover:bg-gray-100 data-[status]:bg-brand-50',
        'border-y border-gray-200',
        '[&.active]:z-10 [&.active]:border-brand-200',
        outstandingBalances?.length == 0 ? 'item-center' : 'items-start'
      )}
    >
      <div className="flex items-center gap-x-3">
        <Avatar
          className="size-9 rounded-lg"
          fallback={name}
        />
        <div className="text-md py-1 flex-1">{name}</div>
        {+(aggregatedOutstandingBalance?.amount ?? 0) === 0 ? (
          <div className="text-xs text-gray-400">Settled up</div>
        ) : (
          <div className="-mt-1 text-right text-sm">
            <div className="text-xs text-gray-400">
              {parseFloat(aggregatedOutstandingBalance?.amount ?? '0') > 0 ? 'You lent' : 'You borrowed'}
            </div>
            <Currency
              currency="PKR"
              value={aggregatedOutstandingBalance?.amount ?? '0'}
            />
          </div>
        )}
      </div>
      <div className="grow text-sm font-medium text-gray-800 pl-12 pt-1">
        <div className="mt-1.5 space-y-1 text-xs font-normal text-gray-400">
          {outstandingBalances?.slice(0, 3).map((e) => (
            <Fragment key={e.friend?.uid}>
              {+e.amount != 0 && +e.amount > 0 && (
                <p>
                  {e.friend?.fullName} borrowed{' '}
                  <Currency
                    currency={e.currency.uid}
                    value={parseFloat(e.amount)}
                  />
                </p>
              )}
              {+e.amount != 0 && +e.amount < 0 && (
                <p>
                  {e.friend?.fullName} lent you{' '}
                  <Currency
                    currency={e.currency.uid}
                    value={parseFloat(e.amount)}
                  />
                </p>
              )}
            </Fragment>
          ))}
          {(outstandingBalances?.length ?? 0) > 3 && (
            <p className="text font-light text-gray-400">and {(outstandingBalances?.length ?? 0) - 3} more</p>
          )}
        </div>
      </div>
    </Link>
  );
}
