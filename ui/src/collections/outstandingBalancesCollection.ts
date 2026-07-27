import { createCollection } from '@tanstack/db';
import { rxdbCollectionOptions } from '@tanstack/rxdb-db-collection';
import { RxCollection } from 'rxdb/plugins/core';

import { ApiRoutes, UserOutstandingBalance } from '@/api-types';
import { AggregatedOutstandingBalance, OutstandingBalance } from '@/api-types/components/schemas';
import { axiosInstance } from '@/axios.ts';
import { rxdbPromise } from '@/rxdb.ts';

// Raw per-currency rows. No natural id — the API doesn't give these rows a uid — so we
// synthesize one from the fields that make a row unique.
export type OutstandingBalanceRow = OutstandingBalance & { id: string };

// Server-computed totals per counterparty per currency — kept as-is (not recomputed
// client-side) so currency/decimal netting stays authoritative from the backend.
export type AggregatedOutstandingBalanceRow = AggregatedOutstandingBalance & { id: string };

const rawBalanceSchema = {
  title: 'outstanding-balance',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 300 },
    amount: { type: 'string' },
    currency: { type: 'string' },
    group: { type: ['string', 'null'] },
    friend: { type: ['string', 'null'] },
  },
  required: ['id', 'amount', 'currency'],
};

const aggregatedBalanceSchema = {
  title: 'aggregated-outstanding-balance',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 300 },
    amount: { type: 'string' },
    currency: { type: 'string' },
    balances: { type: 'array', items: { type: 'object' } },
    type: { type: 'string' },
    uid: { type: 'string' },
  },
  required: ['id', 'amount', 'currency', 'type', 'uid'],
};

const balanceRxCollectionsPromise = rxdbPromise.then(async (db) => {
  const { outstandingBalances, aggregatedOutstandingBalances } = await db.addCollections<{
    outstandingBalances: RxCollection<OutstandingBalanceRow>;
    aggregatedOutstandingBalances: RxCollection<AggregatedOutstandingBalanceRow>;
  }>({
    outstandingBalances: { schema: rawBalanceSchema as never },
    aggregatedOutstandingBalances: { schema: aggregatedBalanceSchema as never },
  });
  return { outstandingBalances, aggregatedOutstandingBalances };
});

export const outstandingBalancesCollection = createCollection(
  rxdbCollectionOptions<OutstandingBalanceRow>({
    rxCollection: (await balanceRxCollectionsPromise).outstandingBalances,
  })
);

export const aggregatedOutstandingBalancesCollection = createCollection(
  rxdbCollectionOptions<AggregatedOutstandingBalanceRow>({
    rxCollection: (await balanceRxCollectionsPromise).aggregatedOutstandingBalances,
  })
);

export async function syncOutstandingBalances() {
  const { outstandingBalances, aggregatedOutstandingBalances } = await balanceRxCollectionsPromise;
  const { data } = await axiosInstance.get<UserOutstandingBalance>(ApiRoutes.USER_OUTSTANDING_BALANCE);

  await outstandingBalances.bulkUpsert(
    data.outstandingBalances.map((row) => ({
      ...row,
      group: row.group ?? null,
      friend: row.friend ?? null,
      id: [row.friend ?? '', row.group ?? '', row.currency].join(':'),
    }))
  );
  await aggregatedOutstandingBalances.bulkUpsert(
    data.aggregatedOutstandingBalance.map((row) => ({
      ...row,
      id: [row.type, row.uid, row.currency].join(':'),
    }))
  );
}

export async function clearOutstandingBalancesCollections() {
  const { outstandingBalances, aggregatedOutstandingBalances } = await balanceRxCollectionsPromise;
  await outstandingBalances.remove();
  await aggregatedOutstandingBalances.remove();
}
