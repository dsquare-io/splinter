import type { Collection } from '@tanstack/db';
import type { RxJsonSchema } from 'rxdb/plugins/core';

import { ApiRoutes } from '@/api-types';
import type { SimpleGroup } from '@/api-types/components/schemas';
import { fetchApi } from '@/hooks/useApiQuery.ts';
import { syncEntity } from '@/hooks/useEntitySync.ts';
import { LocalCollection } from './base/LocalCollection.ts';
import type { SyncableEntity } from './base/types.ts';
import { on } from './events.ts';

const groupSchema = {
  title: 'group',
  version: 0,
  type: 'object',
  primaryKey: 'uid',
  properties: {
    uid: { type: 'string', maxLength: 100 },
    urn: { type: 'string' },
    name: { type: 'string' },
  },
  required: ['uid', 'urn', 'name'],
} as const satisfies RxJsonSchema<SimpleGroup>;

const local = await LocalCollection.create<SimpleGroup>({ name: 'groups', schema: groupSchema });

const sync = () => fetchApi(ApiRoutes.GROUP_LIST).then((rows) => local.replaceAll(rows));

export const groups: SyncableEntity & { collection: Collection<SimpleGroup, string> } = {
  name: local.name,
  collection: local.collection,
  sync,
  rebuild: sync,
  hasCache: () => local.hasSynced(),
};

on('group:mutated', () => syncEntity(groups));
