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

import { Paths } from '@/api-types/routePaths.ts';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { PullToRefresh, ScrollScene, Spinner } from '@/components/primitives';
import { useInfiniteApiQuery } from '@/hooks/useApiQuery';
import { ActivityListItem } from './ActivityListItem.tsx';
import { EmptyActivity } from './EmptyActivity.tsx';

export function ActivityList() {
  const { data, isPending, error, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } =
    useInfiniteApiQuery(Paths.ACTIVITY_LIST);

  const activities = data?.flatMap((page) => page.results) ?? [];
  const sections = Object.entries(groupBy(activities, (a) => a.createdAt.slice(0, 7)));

  return (
    <PullToRefresh onRefresh={refetch}>
      <ListBox
        aria-label="Activity"
        className="flex flex-col"
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
            <EmptyActivity />
          )
        }
      >
        {sections.map(([month, items]) => (
          <ListBoxSection key={month}>
            <Header className="contents">
              <ScrollScene.Sticky className="z-10 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                {format(new Date(month + '-01'), 'MMM yyyy')}
              </ScrollScene.Sticky>
            </Header>
            <Collection items={items}>
              {(activity) => (
                <ListBoxItem
                  id={activity.urn}
                  textValue={activity.description}
                  className="outline-none"
                >
                  <ActivityListItem activity={activity} />
                </ListBoxItem>
              )}
            </Collection>
          </ListBoxSection>
        ))}
        {error && activities.length > 0 ? (
          <ListBoxItem
            textValue="error"
            className="outline-none"
          >
            <ErrorAlert
              error={error}
              variant="centered"
            />
          </ListBoxItem>
        ) : (
          hasNextPage && (
            <ListBoxLoadMoreItem
              onLoadMore={fetchNextPage}
              isLoading={isFetchingNextPage}
              className="flex justify-center py-4"
            >
              <Spinner className="size-5 text-gray-400" />
            </ListBoxLoadMoreItem>
          )
        )}
      </ListBox>
    </PullToRefresh>
  );
}
