import { useEffect, useState } from 'react';
import {
  Collection,
  Header,
  ListBox,
  ListBoxItem,
  ListBoxLoadMoreItem,
  ListBoxSection,
} from 'react-aria-components';

import { useLiveQuery } from '@tanstack/react-db';
import { format } from 'date-fns';
import groupBy from 'just-group-by';

import { ApiRoutes, UrlArgs, type ExpenseOrPayment } from '@/api-types';
import {
  expensesForFriend,
  expensesForGroup,
  ingest,
  scopeKey,
  syncedScopes,
  type LocalExpenseRow,
} from '@/collections/expenses.ts';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { Button, EmptyState, PullToRefresh, Spinner } from '@/components/primitives';
import { useInfiniteApiQuery } from '@/hooks/useApiQuery';
import { useIsOnline } from '@/hooks/useIsOnline.ts';
import { useLocalValue } from '@/hooks/useLocalValue.ts';
import { EmptyExpenses } from './EmptyExpenses.tsx';
import { ExpenseListItem } from './ExpenseListItem.tsx';

type ExpenseListPath = typeof ApiRoutes.FRIEND_EXPENSE_LIST | typeof ApiRoutes.GROUP_EXPENSE_LIST;

type ExpenseListProps<Path extends ExpenseListPath> = {
  apiPath: Path;
  args?: UrlArgs<Path>;
  detailRoute: string;
  detailRouteParams: Record<string, string>;
  className?: string;
};

export function ExpenseList<Path extends ExpenseListPath>({
  apiPath,
  args,
  detailRoute,
  detailRouteParams,
  className = 'my-3 px-4 sm:px-6 md:px-8',
}: ExpenseListProps<Path>) {
  const [settledUpExpandCount, setSettledUpExpandCount] = useState(0);
  const isOnline = useIsOnline();

  // Drives background population + pagination controls; render data comes from useLiveQuery
  // below, over the local mirror those pages get ingested into.
  const { data: pages, isPending, error, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
    useInfiniteApiQuery(apiPath, args);

  const scope =
    apiPath === ApiRoutes.GROUP_EXPENSE_LIST
      ? { type: 'group' as const, uid: (args as { group_uid: string }).group_uid }
      : { type: 'friend' as const, uid: (args as { friend_uid: string }).friend_uid };

  useEffect(() => {
    if (pages?.length) void ingest(pages.flatMap((page) => page.results), scope);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  const { data: localItems } = useLiveQuery((q) => {
    const scoped = scope.type === 'group' ? expensesForGroup(scope.uid)(q) : expensesForFriend(scope.uid)(q);
    return scoped.orderBy(({ expense }: any) => expense.datetime, 'desc');
  }, [scope.type, scope.uid]);

  const allItems = (localItems ?? []) as LocalExpenseRow[];

  // Zero rows is ambiguous on its own — this distinguishes "never synced" from "synced,
  // genuinely empty" so the two don't both fall into the same offline/loading UI.
  const hasSyncedScope = (useLocalValue(syncedScopes) ?? []).includes(scopeKey(scope));

  let paymentsSeen = 0;
  let hitBoundary = false;
  const visible: LocalExpenseRow[] = [];
  for (const row of allItems) {
    if (row.type === 'settlement') {
      paymentsSeen++;
      if (paymentsSeen > settledUpExpandCount) {
        hitBoundary = true;
        break;
      }
    } else {
      visible.push(row);
    }
  }

  const sections = Object.entries(groupBy(visible, (row) => row.datetime.slice(0, 7)));

  return (
    <PullToRefresh onRefresh={refetch}>
      <ListBox
        aria-label="Expenses"
        className={className}
        renderEmptyState={() =>
          hasSyncedScope && allItems.length === 0 ? (
            // Confirmed empty (synced at least once) — always the genuine empty state,
            // regardless of online/pending/error, so it can't be mistaken for "not loaded yet".
            <EmptyExpenses />
          ) : !isOnline && allItems.length === 0 ? (
            // offlineFirst pauses retries rather than erroring while offline, so isPending
            // stays true forever here — there's no real error to hand ErrorAlert, and a
            // spinner would spin indefinitely. This is its own state, not a fetch error.
            <EmptyState
              messages={[
                { icon: '📡', title: "You're offline", body: "This hasn't been loaded before." },
              ]}
            />
          ) : isPending && allItems.length === 0 ? (
            <div className="flex justify-center py-4">
              <Spinner className="size-5 text-gray-400" />
            </div>
          ) : error && allItems.length === 0 ? (
            <ErrorAlert
              error={error}
              variant="centered"
            />
          ) : (
            <EmptyExpenses />
          )
        }
      >
        {sections.map(([month, rows]) => (
          <ListBoxSection key={month}>
            <Header className="pt-4 pb-2 text-sm text-neutral-500">
              {format(new Date(month + '-01'), 'MMM yyyy')}
            </Header>
            <Collection items={rows}>
              {(row) => (
                <ListBoxItem
                  id={row.uid}
                  textValue={(row.item as ExpenseOrPayment).description ?? row.uid}
                  className="outline-none"
                >
                  <ExpenseListItem
                    expense={row.item as ExpenseOrPayment}
                    detailRoute={detailRoute}
                    detailRouteParams={detailRouteParams}
                  />
                </ListBoxItem>
              )}
            </Collection>
          </ListBoxSection>
        ))}
        {error && allItems.length > 0 ? (
          <ListBoxItem
            textValue="error"
            className="outline-none"
          >
            <ErrorAlert
              error={error}
              variant="centered"
            />
          </ListBoxItem>
        ) : hitBoundary && visible.length === 0 ? (
          <ListBoxItem
            textValue="settled"
            className="outline-none"
          >
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <p className="text-4xl">🤝</p>
              <p className="mt-2 text-sm font-medium text-gray-700">All settled up</p>
              <p className="mt-1 max-w-xs text-sm text-gray-400">
                You're square with each other. No outstanding balances.
              </p>
              <Button
                variant="plain"
                size="small"
                className="mt-5"
                onPress={() => setSettledUpExpandCount((c) => c + 1)}
              >
                Load older expenses
              </Button>
            </div>
          </ListBoxItem>
        ) : hitBoundary ? (
          <ListBoxItem
            textValue="settled"
            className="outline-none"
          >
            <div className="flex items-center gap-3 py-3">
              <div className="h-px flex-1 border-t border-dashed border-neutral-200" />
              <Button
                variant="plain"
                size="small"
                onPress={() => setSettledUpExpandCount((c) => c + 1)}
              >
                Load older expenses
              </Button>
              <div className="h-px flex-1 border-t border-dashed border-neutral-200" />
            </div>
          </ListBoxItem>
        ) : null}
        {hasNextPage && (
          <ListBoxLoadMoreItem
            onLoadMore={fetchNextPage}
            isLoading={isFetchingNextPage || hitBoundary}
            className="flex justify-center py-4"
          >
            {!hitBoundary && <Spinner className="size-5 text-gray-400" />}
          </ListBoxLoadMoreItem>
        )}
      </ListBox>
    </PullToRefresh>
  );
}
