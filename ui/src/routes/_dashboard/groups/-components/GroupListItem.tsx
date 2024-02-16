import clx from 'clsx';
import {Fragment} from 'react';

import Currency from '@components/Currency.tsx';
import {Avatar} from '@components/common/Avatar.tsx';
import {Link} from '@tanstack/react-router';

import {GroupWithOutstandingBalance} from '../../../../api-types/components/schemas';

export default function GroupListItem({
  publicId,
  name,
  outstandingBalances,
  aggregatedOutstandingBalances,
}: GroupWithOutstandingBalance) {
  return (
    <Link
      to="/groups/$group"
      params={{group: publicId!}}
      className={clx(
        'flex gap-x-3 px-6 py-3 hover:bg-neutral-100 data-[status]:bg-brand-50',
        outstandingBalances?.['PKR'].length == 0 ? 'item-center' : 'items-start'
      )}
    >
      <Avatar
        className="size-10 rounded-lg"
        fallback={name}
      />
      <div className="grow text-sm font-medium text-gray-800">
        <div className="text-md py-1">
          {name}
        </div>
        <div className="mt-1.5 text-xs font-normal text-gray-400 space-y-1">
          {+(aggregatedOutstandingBalances?.['PKR'] ?? 0) === 0 ||
          outstandingBalances?.['PKR'].length == 0 ? (
            <p>
              <span className="font-medium text-brand-700">Settled up</span>
            </p>
          ) : undefined}
          {outstandingBalances?.['PKR'].slice(0, 2).map((e) => (
            <Fragment key={e.friend.uid}>
              {+e.amount != 0 && +e.amount > 0 && (
                <p>
                  {e.friend.name.split(' ')[0]} borrowed{' '}
                  <Currency
                    currency="PKR"
                    value={parseFloat(e.amount)}
                  />
                </p>
              )}
              {+e.amount != 0 && +e.amount < 0 && (
                <p>
                  {e.friend.name.split(' ')[0]} lent you {' '}
                  <Currency
                    currency="PKR"
                    value={parseFloat(e.amount)}
                  />
                </p>
              )}
            </Fragment>
          ))}
          {(outstandingBalances?.['PKR']?.length ?? 0) > 2 && (
            <p className="text font-light text-gray-400">
              and {(outstandingBalances?.['PKR']?.length ?? 0) - 2} more
            </p>
          )}
        </div>
      </div>
      {+(aggregatedOutstandingBalances?.['PKR'] ?? 0) === 0 ? (
        <div className="text-xs text-gray-400">Settled up</div>
      ) : (
        <div className="text-right text-sm -mt-1">
          <div className="text-xs text-gray-400">
            {parseFloat(aggregatedOutstandingBalances?.['PKR'] ?? '0') > 0 ? 'You lent' : 'You borrowed'}
          </div>
          <Currency
            currency="PKR"
            value={parseFloat(aggregatedOutstandingBalances?.['PKR'] ?? '0')}
          />
        </div>
      )}
    </Link>
  );
}
