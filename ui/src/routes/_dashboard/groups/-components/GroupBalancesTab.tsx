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

type GroupBalancesTabProps = {
  groupUid: string;
};

export function GroupBalancesTab({ groupUid }: GroupBalancesTabProps) {
  const {
    data: members,
    isPending: membersPending,
    error: membersError,
  } = useApiQuery(ApiRoutes.GROUP_MEMBERSHIP_LIST, { groupUid });
  const {
    data: balances,
    isPending: balancesPending,
    error: balancesError,
  } = useApiQuery(ApiRoutes.GROUP_OUTSTANDING_BALANCE, { groupUid });
  const { currentUser } = useAuth();

  if (membersPending || balancesPending || !currentUser) {
    return (
      <div className="my-3 divide-y divide-neutral-200 px-4 sm:px-6 md:px-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-x-2 py-4"
          >
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="size-4 shrink-0 rounded-sm" />
          </div>
        ))}
      </div>
    );
  }

  const error = membersError ?? balancesError;
  if (error) return <ErrorAlert error={error} />;

  const membersByUid = new Map((members ?? []).map((member) => [member.uid, member]));
  const balanceByUsers = Object.entries(groupBy(balances ?? [], (balance) => balance.user));

  if (balanceByUsers.length === 0) return <EmptyBalances />;

  return (
    <Accordion.Root
      className="my-3 divide-y divide-neutral-200 px-4 sm:px-6 md:px-8"
      type="multiple"
      defaultValue={[currentUser.uid]}
    >
      {balanceByUsers.map(([userUid, balances]) => {
        const member = membersByUid.get(userUid);
        return (
          <Accordion.Item
            key={userUid}
            value={userUid}
          >
            <Accordion.Trigger className="flex w-full cursor-pointer items-center gap-x-2 py-4 text-sm">
              <Avatar fallback={member?.name ?? 'Member'} />
              <div className="flex-1 text-left">{member?.name ?? 'Member'}</div>
              <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-600 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
            </Accordion.Trigger>
            <Accordion.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
              <div className="py-3 pl-4">
                {balances.map((e) => {
                  const friend = membersByUid.get(e.friend);
                  return (
                    <div
                      key={`${e.friend}-${e.currency}`}
                      className="relative pb-6"
                    >
                      <span
                        className="absolute top-4 left-[13px] -ml-px h-full w-px bg-gray-200 [:last-of-type>&]:hidden"
                        aria-hidden="true"
                      ></span>
                      <div className="relative flex items-center gap-x-2">
                        <Avatar
                          fallback={friend?.name ?? 'Member'}
                          className="size-6 bg-gray-50"
                        />
                        <div className="text-sm">
                          <span className="text-gray-800">{friend?.name ?? 'Member'}</span>
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
                  );
                })}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
