import { Fragment } from 'react';

import { OutstandingBalance, SimpleUser } from '@/api-types/components/schemas';
import { Money, UserLabel } from '@/components/primitives';

type OutstandingBalanceListProps = {
  balances?: OutstandingBalance[];
  // Raw rows only carry friend/group uids now — caller supplies whatever name lookup it
  // already has on hand (friends collection, group.members, etc).
  resolveFriend: (uid: string) => SimpleUser | undefined;
};

export function OutstandingBalanceList({ balances, resolveFriend }: OutstandingBalanceListProps) {
  if (!balances?.length) return null;

  const top3 = [...balances].sort((a, b) => Math.abs(+b.amount) - Math.abs(+a.amount)).slice(0, 3);

  return (
    <div className="mt-1.5 space-y-0.5 text-xs font-normal text-gray-500">
      {top3.map((e, i) => {
        const friend = e.friend ? resolveFriend(e.friend) : undefined;
        return (
          <Fragment key={i}>
            <p>
              {friend ? <UserLabel user={friend} /> : 'Someone'}
              {+e.amount > 0 ? ' borrowed ' : ' lent '}
              <Money
                currency={e.currency}
                value={e.amount}
              />
            </p>
          </Fragment>
        );
      })}
      {(balances?.length ?? 0) > 3 && (
        <p className="text font-light text-gray-400">and {(balances?.length ?? 0) - 3} more</p>
      )}
    </div>
  );
}
