import type { RxCollection, RxJsonSchema } from 'rxdb/plugins/core';

import { rxdbPromise } from '@/rxdb.ts';

// A shared RxDB collection tracking "has this entity completed a sync at least once",
// keyed by entity name. Living inside RxDB (rather than localStorage) means it gets wiped
// automatically alongside every other collection by db.remove() on logout — no separate
// cache-clearing path to keep in sync.
type SyncStatus = { uid: string; syncedAt: number };

const syncStatusSchema = {
  title: 'sync-status',
  version: 0,
  type: 'object',
  primaryKey: 'uid',
  properties: {
    uid: { type: 'string', maxLength: 100 },
    syncedAt: { type: 'number' },
  },
  required: ['uid', 'syncedAt'],
} as const satisfies RxJsonSchema<SyncStatus>;

let collectionPromise: Promise<RxCollection<SyncStatus>> | undefined;

function getSyncStatusCollection(): Promise<RxCollection<SyncStatus>> {
  if (!collectionPromise) {
    collectionPromise = rxdbPromise
      .then((db) =>
        db.addCollections<{ 'sync-status': RxCollection<SyncStatus> }>({
          'sync-status': { schema: syncStatusSchema },
        })
      )
      .then((created) => created['sync-status']);
  }
  return collectionPromise;
}

export async function markCollectionSynced(name: string): Promise<void> {
  const collection = await getSyncStatusCollection();
  await collection.upsert({ uid: name, syncedAt: Date.now() });
}

export async function hasCollectionSynced(name: string): Promise<boolean> {
  const collection = await getSyncStatusCollection();
  const doc = await collection.findOne(name).exec();
  return doc !== null;
}
