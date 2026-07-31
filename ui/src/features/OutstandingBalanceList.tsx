import clx from 'clsx';
import { ReactNode } from 'react';

import { useLiveQuery } from '@tanstack/react-db';

import { BalanceScopeEnum } from '@/api-types/components/schemas';
import { friends as friendsEntity } from '@/collections/friends.ts';
import { groups as groupsEntity } from '@/collections/groups.ts';
import { Money, UserLabel } from '@/components/primitives';
import { useOutstandingBalances } from '@/hooks/useOutstandingBalances.ts';

export const COLLAPSED_BALANCE_COUNT = 3;

type OutstandingBalanceListProps = {
  scope: BalanceScopeEnum;
  objectUid: string;
  className?: string;
  variant?: 'plain' | 'tree';
  expanded?: boolean;
  onToggleExpand?: () => void;
};

export function OutstandingBalanceList({
  scope,
  objectUid,
  className,
  variant = 'plain',
  expanded,
  onToggleExpand,
}: OutstandingBalanceListProps) {
  const balances = useOutstandingBalances(scope, objectUid);

  // Rows name the other side of the balance — the side the surrounding page isn't already about.
  const isFriendScope = scope === 'friend';

  const { data: friends } = useLiveQuery((q) => q.from({ friend: friendsEntity.collection }));
  const { data: groups } = useLiveQuery((q) => q.from({ group: groupsEntity.collection }));

  if (scope === 'friend' && balances.length === 1 && !balances[0].groupUid) return null;

  const hidden = balances.length - COLLAPSED_BALANCE_COUNT;
  const visible = expanded ? balances : balances.slice(0, COLLAPSED_BALANCE_COUNT);

  const rows: ReactNode[] = visible.map((e) => {
    const friend = e.friendUid ? friends.find((f) => f.uid === e.friendUid) : undefined;
    const group = e.groupUid ? groups.find((g) => g.uid === e.groupUid) : undefined;
    const lent = +e.amount > 0;

    return (
      <>
        You {lent ? 'lent ' : 'borrowed '}
        <Money
          currency={e.currency}
          value={e.amount}
        />
        {isFriendScope ? (
          e.groupUid ? (
            <> in {group?.name ?? 'a group'}</>
          ) : (
            <> directly</>
          )
        ) : (
          <>
            {lent ? ' to ' : ' from '}
            {friend ? <UserLabel user={friend} /> : 'Someone'}
          </>
        )}
      </>
    );
  });

  if (hidden > 0) {
    const label = expanded ? 'Show less' : `and ${hidden} more`;
    rows.push(
      onToggleExpand ? (
        <button
          type="button"
          // The whole summary is tappable on small screens, so keep this from toggling twice.
          onClick={(event) => {
            event.stopPropagation();
            onToggleExpand();
          }}
          className="font-light text-gray-400 underline decoration-dotted underline-offset-2"
        >
          {label}
        </button>
      ) : (
        <span className="font-light text-gray-400">{label}</span>
      )
    );
  }

  const isTree = variant === 'tree';

  return (
    <div className={clx(!isTree && 'space-y-0.5', 'text-xs font-normal text-gray-500', className)}>
      {rows.map((row, i) => (
        <p
          key={i}
          className={
            isTree ?
              clx(
                'relative pb-0.5 pl-4',
                'before:absolute before:top-0 before:left-1 before:w-px before:bg-gray-300',
                i === rows.length - 1 ? 'before:h-2' : 'before:bottom-0',
                'after:absolute after:top-2 after:left-1 after:h-px after:w-2 after:bg-gray-300'
          ): ''}
        >
          {row}
        </p>
      ))}
    </div>
  );
}
