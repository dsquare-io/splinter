import clx from 'clsx';

import { Avatar } from '@components/common/Avatar.tsx';
import { Link } from '@tanstack/react-router';
import { GroupWithOutstandingBalance } from '../../../../api-types/components/schemas';
import { Fragment } from 'react';

export default function GroupListItem({
                                        publicId,
                                        name,
                                        outstandingBalances,
                                        membersOutstandingBalances,
                                      }: GroupWithOutstandingBalance) {

  return (
    <Link
      to="/groups/$group"
      params={{ group: publicId! }}
      className={clx('px-6 py-3 flex gap-x-3 hover:bg-neutral-100 data-[status]:bg-blue-50',
        membersOutstandingBalances?.['PKR'].length == 0 ? 'item-center' : 'items-start')}
    >
      <Avatar className="size-12 rounded-lg" fallback="AF"/>
      <div className="grow text-sm font-medium text-gray-800">
        {name}
        <div className="mt-1 text-xs font-normal text-gray-400">
          {(+outstandingBalances!['PKR'] === 0 || membersOutstandingBalances?.['PKR'].length == 0) ? (
            <p><span className="text-brand-700 font-medium">Settled up</span></p>
          ) : undefined}
          {membersOutstandingBalances?.['PKR'].slice(0, 2).map((e) => (
            <Fragment key={e.friend.uid}>
              {(+e.amount != 0 && +e.amount > 0) && (
                <p>{e.friend.name.split(' ')[0]} borrowed <span
                  className="text-green-700 font-medium"
                >PKR {e.amount}</span></p>
              )}
              {(+e.amount != 0 && +e.amount < 0) && (
                <p>you lent {e.friend.name.split(' ')[0]} <span
                  className="text-rose-700 font-medium"
                >PKR {e.amount}</span></p>
              )}
            </Fragment>
          ))}
          {(membersOutstandingBalances?.['PKR']?.length ?? 0) > 2 && (
            <p
              className="font-light text mt-1 text-gray-400"
            >and {(membersOutstandingBalances?.['PKR']?.length ?? 0) - 2} more</p>
          )}
        </div>
      </div>
      {(+outstandingBalances!['PKR'] === 0) && (
        <div className="text-xs text-blue-800">
          Settled up
        </div>
      )}
      {(+outstandingBalances!['PKR'] > 0) && (
        <div className="text-right">
          <div className="text-xs text-gray-400">You lent</div>
          <div className="text-sm text-green-700">PKR {outstandingBalances!['PKR']}</div>
        </div>
      )}
      {(+outstandingBalances!['PKR'] < 0) && (
        <div className="text-right">
          <div className="text-xs text-gray-400">You borrowed</div>
          <div className="text-sm text-rose-700">PKR {outstandingBalances!['PKR']}</div>
        </div>
      )}
    </Link>
  );
}
