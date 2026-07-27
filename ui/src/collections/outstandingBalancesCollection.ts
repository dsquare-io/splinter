import { createCollection } from '@tanstack/db';
import { rxdbCollectionOptions } from '@tanstack/rxdb-db-collection';
import { RxCollection } from 'rxdb/plugins/core';

import { ApiRoutes, UserOutstandingBalance } from '@/api-types';
import { AggregatedOutstandingBalance, OutstandingBalance } from '@/api-types/components/schemas';
import { axiosInstance } from '@/axios.ts';
import { rxdbPromise } from '@/rxdb.ts';

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

const balanceRxCollectionsPromise = rxdbPromise.then(async (db) => {
  const { outstandingBalances, aggregatedOutstandingBalances } = await db.addCollections<{
    outstandingBalances: RxCollection<OutstandingBalance>;
    aggregatedOutstandingBalances: RxCollection<AggregatedOutstandingBalance>;
  }>({
    outstandingBalances: { schema: rawBalanceSchema as never },
    aggregatedOutstandingBalances: { schema: aggregatedBalanceSchema as never },
  });
  return { outstandingBalances, aggregatedOutstandingBalances };
});

export const outstandingBalancesCollection = createCollection(
  rxdbCollectionOptions<OutstandingBalance>({
    rxCollection: (await balanceRxCollectionsPromise).outstandingBalances,
  })
);

export const aggregatedOutstandingBalancesCollection = createCollection(
  rxdbCollectionOptions<AggregatedOutstandingBalance>({
    rxCollection: (await balanceRxCollectionsPromise).aggregatedOutstandingBalances,
  })
);

export async function syncOutstandingBalances() {
  const { outstandingBalances, aggregatedOutstandingBalances } = await balanceRxCollectionsPromise;
  const { data } = await axiosInstance.get<UserOutstandingBalance>(ApiRoutes.USER_OUTSTANDING_BALANCE);

  await outstandingBalances.bulkUpsert(data.outstandingBalances);
  await aggregatedOutstandingBalances.bulkUpsert(data.aggregatedOutstandingBalance);
}
