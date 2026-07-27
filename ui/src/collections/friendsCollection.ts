import { createCollection } from '@tanstack/db';
import { rxdbCollectionOptions } from '@tanstack/rxdb-db-collection';
import { RxCollection } from 'rxdb/plugins/core';

import { Friend } from '@/api-types';
import { rxdbPromise } from '@/rxdb.ts';

const friendSchema = {
  title: 'friend',
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
  const { friends } = await db.addCollections<{ friends: RxCollection<Friend> }>({
    friends: { schema: friendSchema as never },
  });
  return friends;
});

export const friendsCollection = createCollection(
  rxdbCollectionOptions<Friend>({
    rxCollection: await friendsRxCollectionPromise,
  })
);

export async function syncFriends(friends: Friend[]) {
  const rxCollection = await friendsRxCollectionPromise;
  await rxCollection.bulkUpsert(friends);
}
