import clx from 'clsx';
import { Fragment } from 'react';

import { eq } from '@tanstack/db';
import { useLiveQuery } from '@tanstack/react-db';

import { BalanceScopeEnum } from '@/api-types/components/schemas';
import { friends as friendsEntity } from '@/collections/friends.ts';
import { groups as groupsEntity } from '@/collections/groups.ts';
import { outstandingBalances } from '@/collections/outstandingBalances.ts';
import { Money, UserLabel } from '@/components/primitives';

type OutstandingBalanceListProps = {
  scope: BalanceScopeEnum;
  objectUid: string;
  className?: string;
  hideFriend?: boolean;
  hideGroup?: boolean;
};

export function OutstandingBalanceList({
  scope,
  objectUid,
  className,
  hideFriend,
  hideGroup,
}: OutstandingBalanceListProps) {
  const { data: balances } = useLiveQuery(
    (q) =>
      q
        .from({ balance: outstandingBalances.raw.collection })
        .where(({ balance }) => eq(scope === 'group' ? balance.groupUid : balance.friendUid, objectUid)),
    [scope, objectUid]
  );

  const { data: friends } = useLiveQuery((q) => q.from({ friend: friendsEntity.collection }));
  const { data: groups } = useLiveQuery((q) => q.from({ group: groupsEntity.collection }));

  const visible = balances.filter((b) => !hideFriend || !!b.groupUid);
  if (!visible.length) return null;

  const top3 = [...visible].sort((a, b) => Math.abs(+b.amount) - Math.abs(+a.amount)).slice(0, 3);

  return (
    <div className={clx('space-y-0.5 text-xs font-normal text-gray-500', className)}>
      {top3.map((e, i) => {
        const friend = e.friendUid ? friends.find((f) => f.uid === e.friendUid) : undefined;
        const group = e.groupUid ? groups.find((g) => g.uid === e.groupUid) : undefined;
        const lent = +e.amount > 0;
        return (
          <Fragment key={i}>
            <p>
              You {lent ? 'lent ' : 'borrowed '}
              <Money
                currency={e.currency}
                value={e.amount}
              />
              {!hideFriend && (
                <>
                  {lent ? ' to ' : ' from '}
                  {friend ? <UserLabel user={friend} /> : 'Someone'}
                </>
              )}
              {!hideGroup && e.groupUid && <> in {group?.name ?? 'a group'}</>}
            </p>
          </Fragment>
        );
      })}
      {visible.length > 3 && <p className="text font-light text-gray-400">and {visible.length - 3} more</p>}
    </div>
  );
}
