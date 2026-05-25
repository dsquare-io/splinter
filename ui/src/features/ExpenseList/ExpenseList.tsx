import { useState } from 'react';
import {
  Collection,
  Header,
  ListBox,
  ListBoxItem,
  ListBoxLoadMoreItem,
  ListBoxSection,
} from 'react-aria-components';

import { format } from 'date-fns';
import groupBy from 'just-group-by';

import { ApiRoutes, UrlArgs, type ExpenseOrPayment } from '@/api-types';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { Button } from '@/components/primitives/Button/Button.tsx';
import { Spinner } from '@/components/primitives/Button/Spinner.tsx';
import { useInfiniteApiQuery } from '@/hooks/useApiQuery';
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

  const { data, isPending, error, fetchNextPage, isFetchingNextPage, hasNextPage } = useInfiniteApiQuery(
    apiPath,
    args
  );

  const allItems = data?.flatMap((page) => page.results) ?? [];

  let paymentsSeen = 0;
  let hitBoundary = false;
  const visible: ExpenseOrPayment[] = [];
  for (const item of allItems) {
    if (item.type === 'settlement') {
      paymentsSeen++;
      if (paymentsSeen > settledUpExpandCount) {
        hitBoundary = true;
        break;
      }
    } else {
      visible.push(item);
    }
  }

  const sections = Object.entries(groupBy(visible, (item) => item.datetime.slice(0, 7)));

  return (
    <ListBox
      aria-label="Expenses"
      className={className}
      renderEmptyState={() =>
        isPending ? (
          <div className="flex justify-center py-4">
            <Spinner className="size-5 text-gray-400" />
          </div>
        ) : error ? (
          <ErrorAlert
            error={error}
            variant="centered"
          />
        ) : (
          <EmptyExpenses />
        )
      }
    >
      {sections.map(([month, items]) => (
        <ListBoxSection key={month}>
          <Header className="bg-gray-50/70 pt-4 pb-2 text-sm text-neutral-500">
            {format(new Date(month + '-01'), 'MMM yyyy')}
          </Header>
          <Collection items={items}>
            {(expense) => (
              <ListBoxItem
                id={expense.uid}
                textValue={expense.description ?? expense.uid}
                className="outline-none"
              >
                <ExpenseListItem
                  expense={expense}
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
  );
}
