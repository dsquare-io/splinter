import { ChevronDownIcon } from '@heroicons/react/24/outline';
import * as Accordion from '@radix-ui/react-accordion';
import groupBy from 'just-group-by';

import { ApiRoutes } from '@/api-types';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Avatar, Money } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { useAuth } from '@/hooks/useAuth.ts';
import { EmptyBalances } from './EmptyBalances.tsx';

interface Props {
  group_uid: string;
}

export function GroupBalancesTab({ group_uid }: Props) {
  const { data, isPending, error } = useApiQuery(ApiRoutes.GROUP_DETAIL, { group_uid });
  const { currentUser } = useAuth();

  if (isPending || !currentUser) {
    return (
      <div className="my-2 divide-y divide-neutral-200">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-x-2 py-4"
          >
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <ErrorAlert error={error} />;

  const balanceByUsers = Object.entries(
    groupBy(data.outstandingBalances ?? [], (balance) => balance.user.uid)
  );

  if (balanceByUsers.length === 0) return <EmptyBalances />;

  return (
    <Accordion.Root
      className="my-3 divide-y divide-neutral-200 px-4 sm:px-6 md:px-8"
      type="multiple"
      defaultValue={[currentUser.uid]}
    >
      {balanceByUsers.map(([userId, balances]) => (
        <Accordion.Item
          key={userId}
          value={userId}
        >
          <Accordion.Trigger className="flex w-full cursor-pointer items-center gap-x-2 py-4 text-sm">
            <Avatar fallback={balances[0]!.user.name} />
            <div className="flex-1 text-left">{balances[0]!.user.name}</div>
            <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-600 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </Accordion.Trigger>
          <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
            <div className="py-3 pl-4">
              {balances.map((e) => (
                <div
                  key={e.friend?.uid ?? e.currency.uid}
                  className="relative pb-6"
                >
                  <span
                    className="absolute top-4 left-[13px] -ml-px h-full w-px bg-gray-200 [:last-of-type>&]:hidden"
                    aria-hidden="true"
                  ></span>
                  <div className="relative flex items-center gap-x-2">
                    <div className="bg-gray-50 ring-[6px] ring-gray-50">
                      <Avatar
                        fallback={e.friend.name}
                        className="size-6"
                      />
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-800">{e.friend.name}</span>
                      {+e.amount < 0 ? (
                        <span className="text-gray-500"> lent you </span>
                      ) : (
                        <span className="text-gray-500"> borrowed </span>
                      )}
                      <Money
                        currency={e.currency}
                        value={e.amount}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
