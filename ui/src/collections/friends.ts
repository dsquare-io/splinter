import type { Collection } from '@tanstack/db';
import type { RxJsonSchema } from 'rxdb/plugins/core';

import { ApiRoutes, type Friend } from '@/api-types';
import { fetchApi } from '@/hooks/useApiQuery.ts';
import { syncEntity } from '@/hooks/useEntitySync.ts';
import { LocalCollection } from './base/LocalCollection.ts';
import type { SyncableEntity } from './base/types.ts';
import { on } from './events.ts';

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
} as const satisfies RxJsonSchema<Friend>;

const local = await LocalCollection.create<Friend>({ name: 'friends', schema: friendSchema });

const sync = () => fetchApi(ApiRoutes.FRIEND_LIST).then((rows) => local.replaceAll(rows));

export const friends: SyncableEntity & { collection: Collection<Friend, string> } = {
  name: local.name,
  collection: local.collection,
  sync,
  rebuild: sync,
  hasCache: () => local.hasSynced(),
};

on('friend:mutated', () => syncEntity(friends));
