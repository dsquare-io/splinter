import { Fragment } from 'react';

import { FriendOutstandingBalance, GroupOutstandingBalance } from '@/api-types/components/schemas';
import { Money, UserLabel } from '@/components/primitives';

type Balance = FriendOutstandingBalance | GroupOutstandingBalance;

type OutstandingBalanceListProps = {
  balances?: Balance[];
};

export function OutstandingBalanceList({ balances }: OutstandingBalanceListProps) {
  if (!balances?.length) return null;

  const top3 = [...balances].sort((a, b) => Math.abs(+b.amount) - Math.abs(+a.amount)).slice(0, 3);

  return (
    <div className="mt-1.5 space-y-0.5 text-xs font-normal text-gray-500">
      {top3.map((e, i) => (
        <Fragment key={i}>
          <p>
            <UserLabel user={e.friend} />
            {+e.amount > 0 ? ' borrowed ' : ' lent '}
            <Money
              currency={e.currency}
              value={e.amount}
            />
            {'group' in e && e.group && <> in {e.group.name}</>}
          </p>
        </Fragment>
      ))}
      {(balances?.length ?? 0) > 3 && (
        <p className="text font-light text-gray-400">and {(balances?.length ?? 0) - 3} more</p>
      )}
    </div>
  );
}
