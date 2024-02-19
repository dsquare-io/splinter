import clx from 'clsx';
import {Fragment} from 'react';

import Currency from '@components/Currency.tsx';
import {Avatar} from '@components/common/Avatar.tsx';
import {Link} from '@tanstack/react-router';

import {Group} from '@/api-types/components/schemas';

export default function GroupListItem({uid, name, outstandingBalances, aggregatedOutstandingBalance}: Group) {
  return (
    <Link
      to="/groups/$group"
      params={{group: uid!}}
      className={clx(
        'relative flex gap-x-3 px-6 py-4 hover:bg-gray-100 data-[status]:bg-brand-50',
        'border-y border-gray-200',
        '[&.active]:z-10 [&.active]:border-brand-200',
        outstandingBalances?.length == 0 ? 'item-center' : 'items-start'
      )}
    >
      <Avatar
        className="size-10 rounded-lg"
        fallback={name}
      />
      <div className="grow text-sm font-medium text-gray-800">
        <div className="text-md py-1">{name}</div>
        <div className="mt-1.5 space-y-1 text-xs font-normal text-gray-400">
          {+(aggregatedOutstandingBalance?.amount ?? 0) === 0 && (
            <p>
              <span className="font-medium text-brand-700">Settled up</span>
            </p>
          )}
          {outstandingBalances?.slice(0, 3).map((e) => (
            <Fragment key={e.friend.uid}>
              {+e.amount != 0 && +e.amount > 0 && (
                <p>
                  {e.friend.fullName} borrowed{' '}
                  <Currency
                    currency={e.currency.uid}
                    value={parseFloat(e.amount)}
                  />
                </p>
              )}
              {+e.amount != 0 && +e.amount < 0 && (
                <p>
                  {e.friend.fullName} lent you{' '}
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
    </Link>
  );
}
