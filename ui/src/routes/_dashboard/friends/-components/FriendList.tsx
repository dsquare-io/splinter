import { useEffect, useMemo } from 'react';

import { useLiveQuery } from '@tanstack/react-db';
import groupBy from 'just-group-by';

import { ApiRoutes } from '@/api-types';
import { friendsCollection, syncFriendIdentities } from '@/collections/friendsCollection.ts';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { FriendListItemSkeleton } from '@/components/layout/Skeleton.tsx';
import { PullToRefresh, ScrollScene } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { EmptyFriends } from './EmptyFriends.tsx';
import { FriendListItem } from './FriendListItem.tsx';

export function FriendList() {
  // Balances stay on the existing react-query path so they keep invalidating via
  // invalidateQueriesForExpense; identity is mirrored into RxDB below for offline reads.
  const { data: friendsWithBalances, error, refetch } = useApiQuery(ApiRoutes.FRIEND_LIST);
  const { data: identities, isLoading: identitiesLoading } = useLiveQuery((q) =>
    q.from({ friend: friendsCollection })
  );

  useEffect(() => {
    if (friendsWithBalances) syncFriendIdentities(friendsWithBalances);
  }, [friendsWithBalances]);

  const balanceByUid = useMemo(
    () => new Map((friendsWithBalances ?? []).map((friend) => [friend.uid, friend])),
    [friendsWithBalances]
  );

  const friends = identities.map((identity) => ({
    ...identity,
    ...balanceByUid.get(identity.uid),
  }));

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="flex flex-col -space-y-px">
        {error && identities.length === 0 ? (
          <ErrorAlert
            error={error}
            variant="centered"
          />
        ) : identitiesLoading && identities.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => <FriendListItemSkeleton key={i} />)
        ) : friends.length === 0 ? (
          <EmptyFriends />
        ) : (
          Object.entries(groupBy(friends, (friend) => friend.name[0].toLowerCase()))
            .sort((a, b) => (a[0] < b[0] ? -1 : +1))
            .map(([letter, friends]) => (
              <div
                key={letter}
                className="-space-y-px"
              >
                <ScrollScene.Sticky className="z-10 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                  <h3 className="uppercase">{letter}</h3>
                </ScrollScene.Sticky>
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
    </PullToRefresh>
  );
}
