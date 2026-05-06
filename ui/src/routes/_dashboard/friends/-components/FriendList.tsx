import groupBy from 'just-group-by';

import { ApiRoutes } from '@/api-types';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { FriendListItemSkeleton } from '@/components/layout/Skeleton.tsx';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { EmptyFriends } from './EmptyFriends.tsx';
import { FriendListItem } from './FriendListItem.tsx';

export function FriendList() {
  const { data: friends, isPending, error } = useApiQuery(ApiRoutes.FRIEND_LIST);

  if (error)
    return (
      <ErrorAlert
        error={error}
        variant="centered"
      />
    );

  return (
    <div className="flex h-full flex-col -space-y-px overflow-y-auto">
      {isPending ? (
        Array.from({ length: 6 }).map((_, i) => <FriendListItemSkeleton key={i} />)
      ) : !friends?.length ? (
        <EmptyFriends />
      ) : (
        Object.entries(groupBy(friends, (friend) => friend.name[0].toLowerCase()))
          .sort((a, b) => (a[0] < b[0] ? -1 : +1))
          .map(([letter, friends]) => (
            <div
              key={letter}
              className="-space-y-px"
            >
              <div className="sticky top-0 z-20 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                <h3 className="uppercase">{letter}</h3>
              </div>
              <div className="-space-y-px">
                {friends.map((friend) => (
                  <FriendListItem
                    key={friend.uid}
                    {...friend}
                  />
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
