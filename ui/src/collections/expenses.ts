import { and, BTreeIndex, eq, gte, lte, queryOnce } from '@tanstack/db';

import { ApiRoutes, type ExpenseOrPaymentOrSettlement } from '@/api-types';
import { fetchApi } from '@/hooks/useApiQuery.ts';
import { LocalCollection } from './base/LocalCollection.ts';
import { on } from './events.ts';

type Scope = { type: 'group' | 'friend'; uid: string };

export type LocalExpenseRow = {
  uid: string;
  type: 'expense' | 'payment' | 'settlement';
  datetime: string;
  group: string;
  isDeleted: boolean;
  item: ExpenseOrPaymentOrSettlement;
};

type ExpenseParticipant = { id: string; expenseUid: string; friendUid: string };

const expenseSchema = {
  title: 'expense',
  version: 0,
  type: 'object',
  primaryKey: 'uid',
  properties: {
    uid: { type: 'string', maxLength: 100 },
    type: { type: 'string' },
    datetime: { type: 'string', maxLength: 40 },
    group: { type: 'string', maxLength: 100 },
    isDeleted: { type: 'boolean' },
    item: { type: 'object' },
  },
  required: ['uid', 'type', 'datetime', 'group', 'isDeleted', 'item'],
  indexes: ['group', 'datetime'],
};

const participantSchema = {
  title: 'expense-participant',
  version: 0,
  type: 'object',
  primaryKey: 'id',
  properties: {
    id: { type: 'string', maxLength: 200 },
    expenseUid: { type: 'string', maxLength: 100 },
    friendUid: { type: 'string', maxLength: 100 },
  },
  required: ['id', 'expenseUid', 'friendUid'],
  indexes: ['friendUid'],
};

const local = await LocalCollection.create<LocalExpenseRow>({ name: 'expenses', schema: expenseSchema as never });
const participantsLocal = await LocalCollection.create<ExpenseParticipant>({
  name: 'expense-participants',
  schema: participantSchema as never,
});

local.collection.createIndex((row) => row.group, { indexType: BTreeIndex });
local.collection.createIndex((row) => row.datetime, { indexType: BTreeIndex });
participantsLocal.collection.createIndex((row) => row.friendUid, { indexType: BTreeIndex });

function toRow(item: ExpenseOrPaymentOrSettlement, scope?: Scope): LocalExpenseRow {
  const datetime = item.type === 'settlement' ? item.createdAt : item.datetime;
  const group = item.type === 'settlement' ? (scope?.type === 'group' ? scope.uid : '') : item.group;
  const isDeleted = item.type !== 'settlement' && item.isDeleted;
  return { uid: item.uid, type: item.type, datetime, group, isDeleted, item };
}

function toParticipants(item: ExpenseOrPaymentOrSettlement, scope?: Scope): ExpenseParticipant[] {
  const friendUids =
    item.type === 'expense'
      ? [...new Set(item.expenses.flatMap((c) => c.shares.map((s) => s.user)))]
      : item.type === 'payment'
        ? [item.sender.uid, item.receiver.uid]
        : scope?.type === 'friend'
          ? [scope.uid]
          : [];
  return friendUids.map((friendUid) => ({ id: `${item.uid}:${friendUid}`, expenseUid: item.uid, friendUid }));
}

// Unfiltered — reconcileStaleRows needs to see already-deleted rows too (see there for why).
const rawExpensesForGroup = (groupUid: string) => (q: any) =>
  q.from({ expense: local.collection }).where(({ expense }: any) => eq(expense.group, groupUid));

const rawExpensesForFriend = (friendUid: string) => (q: any) =>
  q
    .from({ expense: local.collection })
    .join({ p: participantsLocal.collection }, ({ expense, p }: any) => eq(expense.uid, p.expenseUid), 'inner')
    .where(({ p }: any) => eq(p.friendUid, friendUid));

export const expensesForGroup = (groupUid: string) => (q: any) =>
  q
    .from({ expense: local.collection })
    .where(({ expense }: any) => and(eq(expense.group, groupUid), eq(expense.isDeleted, false)));

// NOTE: joined queries return rows namespaced by source alias ({expense, p}), not flat —
// confirmed live (a bare join crashed rendering trying to read row.datetime off undefined).
// Callers must normalize with `row.expense ?? row` (see ExpenseList.tsx / reconcileStaleRows).
export const expensesForFriend = (friendUid: string) => (q: any) =>
  q
    .from({ expense: local.collection })
    .join({ p: participantsLocal.collection }, ({ expense, p }: any) => eq(expense.uid, p.expenseUid), 'inner')
    .where(({ expense, p }: any) => and(eq(p.friendUid, friendUid), eq(expense.isDeleted, false)));

/**
 * Deletes rows provably gone server-side, via date-range overlap — no "list everything"
 * endpoint exists to full-resync against. Relies on expenses always being fetched in
 * contiguous, date-sorted windows (older-extending pagination or newest-edge refresh).
 * Uses raw (unfiltered) queries: an already-deleted row is *expected* to be absent from a
 * fresh fetch (list endpoints never return deleted items) — that's not evidence it's newly
 * stale, so it must stay visible to this comparison to be correctly excluded from removal.
 */
async function reconcileStaleRows(scope: Scope, items: ExpenseOrPaymentOrSettlement[]): Promise<void> {
  if (!items.length) return;
  const dates = items.map((item) => (item.type === 'settlement' ? item.createdAt : item.datetime));
  const batchMin = dates.reduce((a, b) => (a < b ? a : b));
  const batchMax = dates.reduce((a, b) => (a > b ? a : b));
  const incomingUids = new Set(items.map((item) => item.uid));

  const scopedQuery = scope.type === 'group' ? rawExpensesForGroup(scope.uid) : rawExpensesForFriend(scope.uid);
  const [oldest] = await queryOnce((q) => scopedQuery(q).orderBy(({ expense }: any) => expense.datetime, 'asc').limit(1));
  const [newest] = await queryOnce((q) => scopedQuery(q).orderBy(({ expense }: any) => expense.datetime, 'desc').limit(1));
  if (!oldest || !newest) return;

  // NOTE: verify at implementation/runtime whether a joined query's rows are namespaced
  // ({expense, p}) or flat — single-source queries are confirmed flat elsewhere in this repo.
  const dateOf = (row: any) => row.expense?.datetime ?? row.datetime;
  const uidOf = (row: any) => row.expense?.uid ?? row.uid;
  const isDeletedOf = (row: any) => row.expense?.isDeleted ?? row.isDeleted;

  const overlapStart = batchMin > dateOf(oldest) ? batchMin : dateOf(oldest);
  const overlapEnd = batchMax < dateOf(newest) ? batchMax : dateOf(newest);
  if (overlapStart > overlapEnd) return;

  const inRange = await queryOnce((q) =>
    scopedQuery(q).where(({ expense }: any) => gte(expense.datetime, overlapStart) && lte(expense.datetime, overlapEnd))
  );
  const staleUids = inRange
    .filter((row: any) => !isDeletedOf(row))
    .map(uidOf)
    .filter((uid: string) => !incomingUids.has(uid));
  if (staleUids.length) await local.removeMany(staleUids);
}

export async function ingest(items: ExpenseOrPaymentOrSettlement[], scope?: Scope): Promise<void> {
  const rows = items.map((item) => toRow(item, scope));
  const participants = items.flatMap((item) => toParticipants(item, scope));
  await Promise.all([local.upsertMany(rows), participantsLocal.upsertMany(participants)]);
  if (scope) await reconcileStaleRows(scope, items);
}

export const expenses = { name: local.name, collection: local.collection, expensesForGroup, expensesForFriend, ingest };
export const expenseParticipants = { collection: participantsLocal.collection };

on('expense:mutated', async ({ uid }) => {
  try {
    const item = await fetchApi(ApiRoutes.EXPENSE_DETAIL, { expense_uid: uid });
    await ingest([item]);
  } catch (err) {
    console.warn('expenses: single-item refresh skipped', uid, err);
  }
});
