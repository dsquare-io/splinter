import { useEffect, useState } from 'react';

import { useLiveQuery } from '@tanstack/react-db';
import groupBy from 'just-group-by';

import { ApiRoutes } from '@/api-types';
import { friendsCollection, syncFriends } from '@/collections/friendsCollection.ts';
import {
  aggregatedOutstandingBalancesCollection,
  outstandingBalancesCollection,
  syncOutstandingBalances,
} from '@/collections/outstandingBalancesCollection.ts';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { FriendListItemSkeleton } from '@/components/layout/Skeleton.tsx';
import { PullToRefresh, ScrollScene } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { EmptyFriends } from './EmptyFriends.tsx';
import { FriendListItem } from './FriendListItem.tsx';

export function FriendList() {
  // Identity survives offline via RxDB (friendsCollection). Balances are their own
  // RxDB collections now too — see outstandingBalancesCollection.ts.
  const { data: friendIdentities, error, refetch } = useApiQuery(ApiRoutes.FRIEND_LIST);
  const { data: identities, isLoading: identitiesLoading } = useLiveQuery((q) =>
    q.from({ friend: friendsCollection })
  );
  const { data: aggregatedBalances } = useLiveQuery((q) =>
    q.from({ balance: aggregatedOutstandingBalancesCollection })
  );
  const { data: rawBalances } = useLiveQuery((q) => q.from({ balance: outstandingBalancesCollection }));
  const [balancesSynced, setBalancesSynced] = useState(false);

  useEffect(() => {
    if (friendIdentities) syncFriends(friendIdentities);
  }, [friendIdentities]);

  useEffect(() => {
    syncOutstandingBalances().then(() => setBalancesSynced(true));
  }, []);

  const friends = identities.map((identity) => ({
    ...identity,
    aggregatedOutstandingBalances: aggregatedBalances.filter(
      (b) => b.objectType === 'friend' && b.objectUid === identity.uid
    ),
    outstandingBalances: rawBalances.filter((b) => b.friend === identity.uid),
    balancesLoading: !balancesSynced,
  }));

  return (
    <PullToRefresh
      onRefresh={async () => {
        await Promise.all([refetch(), syncOutstandingBalances()]);
      }}
    >
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
