import type { Collection } from '@tanstack/db';

import { ApiRoutes } from '@/api-types';
import type { AggregatedOutstandingBalance, OutstandingBalance } from '@/api-types/components/schemas';
import { fetchApi } from '@/hooks/useApiQuery.ts';
import { syncEntity } from '@/hooks/useEntitySync.ts';
import { LocalCollection } from './base/LocalCollection.ts';
import type { SyncableEntity } from './base/types.ts';
import { on } from './events.ts';

const rawBalanceSchema = {
  title: 'outstanding-balance',
  version: 0,
  type: 'object',
  primaryKey: 'uid',
  properties: {
    uid: { type: 'string', maxLength: 255 },
    amount: { type: 'string' },
    currency: { type: 'string' },
    group: { type: ['string', 'null'] },
    friend: { type: ['string', 'null'] },
  },
  required: ['uid', 'amount', 'currency'],
};

const aggregatedBalanceSchema = {
  title: 'aggregated-outstanding-balance',
  version: 0,
  type: 'object',
  primaryKey: 'uid',
  properties: {
    uid: { type: 'string', maxLength: 255 },
    amount: { type: 'string' },
    currency: { type: 'string' },
    balances: { type: 'array', items: { type: 'object' } },
    objectType: { type: 'string' },
    objectUid: { type: 'string' },
  },
  required: ['uid', 'amount', 'currency', 'objectType', 'objectUid'],
};

const rawLocal = await LocalCollection.create<OutstandingBalance>({
  name: 'outstanding-balances',
  schema: rawBalanceSchema as never,
});
const aggregatedLocal = await LocalCollection.create<AggregatedOutstandingBalance>({
  name: 'aggregated-outstanding-balances',
  schema: aggregatedBalanceSchema as never,
});

async function syncBoth() {
  const data = await fetchApi(ApiRoutes.USER_OUTSTANDING_BALANCE);
  await Promise.all([
    rawLocal.replaceAll(data.outstandingBalances),
    aggregatedLocal.replaceAll(data.aggregatedOutstandingBalance),
  ]);
}

export const outstandingBalances: SyncableEntity & {
  raw: { collection: Collection<OutstandingBalance, string> };
  aggregated: { collection: Collection<AggregatedOutstandingBalance, string> };
} = {
  name: 'outstanding-balances', // shared name -> shared query key -> dedupes concurrent syncs
  raw: { collection: rawLocal.collection },
  aggregated: { collection: aggregatedLocal.collection },
  sync: syncBoth,
  rebuild: syncBoth,
};

on('expense:mutated', () => syncEntity(outstandingBalances));
