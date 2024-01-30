import { Avatar } from '@components/common/Avatar';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ApiRoutes } from '@/api-types';
import { apiQueryOptions, useApiQuery } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';

export const Route = createFileRoute('/_dashboard/groups/$group')({
  loader: ({ params: { group: group_uid } }) => queryClient.ensureQueryData(apiQueryOptions(ApiRoutes.GROUP_DETAIL, { group_uid })),
  component: RootComponent,
  errorComponent: () => <div>Error</div>,
});

function RootComponent() {
  const { group: group_uid } = Route.useParams();

  const { data } = useApiQuery(ApiRoutes.GROUP_DETAIL, { group_uid });
  if (!data) return null;

  return (
    <div className="">
      <Link
        className="px-6 pt-6 pb-4 flex items-center gap-x-1.5 xl:hidden text-sm text-brand-700 font-medium mb-1"
        to="/friends"
      >
        <ChevronLeftIcon className="size-3"/>
        Group
      </Link>
      <article>
        <div>
          <div className="h-32 lg:h-48">
          </div>
          <div className="mx-auto  px-4 sm:px-6 lg:px-8">
            <div className="-mt-12 sm:flex sm:items-end space-x-3">
              <div className="flex">
                <Avatar className="bg-gray-200 size-24 text-3xl" fallback="GP"/>
              </div>
              <div
                className="mt-6 flex items-end justify-between w-full"
              >
                <div className="mt-6 min-w-0 flex-1">
                  <h1 className="truncate text-2xl font-bold text-gray-800">{data.name}</h1>
                  {/*{group.balance == 0 ? (*/}
                  {/*  <p className="text-sm font-medium text-gray-400">All settled up</p>*/}
                  {/*) : undefined}*/}
                  {/*{group.balance > 0 ? (*/}
                  {/*  <p className="text-sm font-normal text-gray-400">{group.name} owes you <span*/}
                  {/*    className="text-green-700">{group.currency} {group.balance}</span></p>*/}
                  {/*) : undefined}*/}
                  {/*{group.balance < 0 ? (*/}
                  {/*  <p className="text-sm font-normal text-gray-400">You owe {group.name}<span*/}
                  {/*    className="text-green-700">{group.currency} {group.balance}</span></p>*/}
                  {/*) : undefined}*/}
                </div>
                <button
                  type="button"
                  className="inline-flex justify-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-gray-200 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-50"
                >
                  Settle up
                </button>
              </div>
            </div>
            <div className="mt-6 hidden min-w-0 flex-1 sm:block 2xl:hidden">
              <h1 className="truncate text-2xl font-bold text-gray-900">hi</h1>
            </div>
          </div>
        </div>
        {/*<div className="w-full mb-4 mt-8 border-t border-blue-100/70"/>*/}
        {/*<p className="text-sm font-medium text-gray-500 px-4 sm:px-6 lg:px-8">December 2022</p>*/}
        {/*<div className=" divide-y divide-gray-200 border-b border-gray-200">*/}
        {/*  {items.map((item) => {*/}
        {/*    return (*/}
        {/*      <SingleEntryItem {...item} key={item.id}/>*/}
        {/*    );*/}
        {/*  })}*/}
        {/*</div>*/}
        {/*<p className="text-sm font-medium text-gray-500 px-4 sm:px-6 lg:px-8 mt-6">January 2023</p>*/}
        {/*<div className="divide-y divide-gray-200">*/}
        {/*  {items.map((item) => {*/}
        {/*    return (*/}
        {/*      <SingleEntryItem {...item} key={item.id}/>*/}
        {/*    );*/}
        {/*  })}*/}
        {/*</div>*/}
      </article>
    </div>
  );
}
