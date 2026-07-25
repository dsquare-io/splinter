import { createCollection } from '@tanstack/db';
import { rxdbCollectionOptions } from '@tanstack/rxdb-db-collection';
import { RxCollection } from 'rxdb/plugins/core';

import { Friend } from '@/api-types';
import { rxdbPromise } from '@/rxdb.ts';

export type FriendIdentity = Pick<Friend, 'uid' | 'urn' | 'name' | 'isActive' | 'email'>;

// Identity only — balances stay on the existing react-query path (see FriendList.tsx)
// so they keep invalidating via invalidateQueriesForExpense without RxDB involvement.
const friendIdentitySchema = {
  title: 'friend-identity',
  version: 0,
  type: 'object',
  primaryKey: 'uid',
  properties: {
    uid: { type: 'string', maxLength: 100 },
    urn: { type: 'string' },
    name: { type: 'string' },
    isActive: { type: 'boolean' },
    email: { type: ['string', 'null'] },
  },
  required: ['uid', 'urn', 'name', 'isActive'],
};

const friendsRxCollectionPromise = rxdbPromise.then(async (db) => {
  const { friends } = await db.addCollections<{ friends: RxCollection<FriendIdentity> }>({
    friends: { schema: friendIdentitySchema as never },
  });
  return friends;
});

export const friendsCollection = createCollection(
  rxdbCollectionOptions<FriendIdentity>({
    rxCollection: await friendsRxCollectionPromise,
  })
);

export async function syncFriendIdentities(friends: Friend[]) {
  const rxCollection = await friendsRxCollectionPromise;
  await rxCollection.bulkUpsert(
    friends.map(({ uid, urn, name, isActive, email }) => ({ uid, urn, name, isActive, email: email ?? null }))
  );
}

export async function clearFriendsCollection() {
  const rxCollection = await friendsRxCollectionPromise;
  await rxCollection.remove();
}
