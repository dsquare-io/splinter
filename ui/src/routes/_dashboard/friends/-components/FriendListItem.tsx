import { ExclamationTriangleIcon } from '@heroicons/react/16/solid';
import { Link } from '@tanstack/react-router';

import { Friend } from '@/api-types';
import { Avatar } from '@/components/primitives';
import { OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';
import { PrimaryOutstandingBalance } from '@/features/PrimaryOutstandingBalance.tsx';

type FriendListItemProps = {
  friend: Friend;
};

export function FriendListItem({ friend }: FriendListItemProps) {
  return (
    <Link
      to="/friends/$friend"
      params={{ friend: friend.uid }}
      className="data-status:bg-brand-50 [&.active]:border-brand-200 relative block w-full items-start border-y border-gray-200 px-6 py-4 hover:bg-gray-100 [&.active]:z-10"
    >
      <div className="flex items-center gap-x-3">
        {friend.isActive ? (
          <Avatar
            className="size-9"
            fallback={friend.name}
          />
        ) : (
          <div className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-sm text-amber-400 ring-1 ring-amber-200">
            <ExclamationTriangleIcon className="size-4 text-amber-400" />
          </div>
        )}
        <div className="text-md flex flex-1 items-center gap-2 py-1">{friend.name}</div>
        <PrimaryOutstandingBalance
          scope="friend"
          objectUid={friend.uid}
        />
      </div>

      <OutstandingBalanceList
        scope="friend"
        objectUid={friend.uid}
        hideFriend
        className="grow pt-1 pl-12 text-sm font-medium text-gray-800"
      />
    </Link>
  );
}
