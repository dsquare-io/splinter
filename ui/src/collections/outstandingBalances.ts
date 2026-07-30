import type { Collection } from '@tanstack/db';
import type { RxJsonSchema } from 'rxdb/plugins/core';

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
    // RxDB can't index a nullable field, so absence is stored as '' rather than null —
    // sanitized on the way in by `sanitizeBalance` below.
    groupUid: { type: 'string', maxLength: 100 },
    friendUid: { type: 'string', maxLength: 100 },
  },
  required: ['uid', 'amount', 'currency', 'groupUid', 'friendUid'],
  indexes: ['groupUid', 'friendUid'],
} as const satisfies RxJsonSchema<OutstandingBalance>;

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
    balanceScope: { type: 'string', maxLength: 20 },
    objectUid: { type: 'string', maxLength: 100 },
  },
  required: ['uid', 'amount', 'currency', 'balanceScope', 'objectUid'],
  indexes: ['balanceScope', ['balanceScope', 'objectUid']],
} as const satisfies RxJsonSchema<AggregatedOutstandingBalance>;

const rawLocal = await LocalCollection.create<OutstandingBalance>({
  name: 'outstanding-balances',
  schema: rawBalanceSchema,
});
const aggregatedLocal = await LocalCollection.create<AggregatedOutstandingBalance>({
  name: 'aggregated-outstanding-balances',
  schema: aggregatedBalanceSchema,
});

function sanitizeBalance(balance: OutstandingBalance): OutstandingBalance {
  return { ...balance, groupUid: balance.groupUid ?? '', friendUid: balance.friendUid ?? '' };
}

async function syncBoth() {
  const data = await fetchApi(ApiRoutes.USER_OUTSTANDING_BALANCE);
  await Promise.all([
    rawLocal.replaceAll(data.outstandingBalances.map(sanitizeBalance)),
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
  hasCache: () => rawLocal.hasSynced(),
};

on('expense:mutated', () => syncEntity(outstandingBalances));
