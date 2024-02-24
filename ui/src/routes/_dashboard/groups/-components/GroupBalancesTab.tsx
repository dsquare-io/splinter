import {ChevronDownIcon} from '@heroicons/react/24/outline';
import * as Accordion from '@radix-ui/react-accordion';
import groupBy from 'just-group-by';

import {ApiRoutes} from '@/api-types';
import Currency from '@/components/Currency.tsx';
import {Avatar} from '@/components/common';
import {useApiQuery} from '@/hooks/useApiQuery.ts';

interface Props {
  group_uid: string;
}

export function GroupBalancesTab({group_uid}: Props) {
  const {data} = useApiQuery(ApiRoutes.GROUP_DETAIL, {group_uid});
  const {data: profileData} = useApiQuery(ApiRoutes.PROFILE);
  if (!data || !profileData) return null;

  const balanceByUsers = Object.entries(
    groupBy(data.outstandingBalances ?? [], (balance) => balance.user.uid)
  );

  return (
    <Accordion.Root
      className="my-2 divide-y divide-neutral-200"
      type="multiple"
      defaultValue={[profileData.uid]}
    >
      {balanceByUsers.map(([userId, balances]) => (
        <Accordion.Item
          key={userId}
          value={userId}
        >
          <Accordion.Trigger className="flex w-full cursor-pointer items-center gap-x-2 py-4 text-sm">
            <Avatar fallback={balances[0]!.user.fullName} />
            <div className="flex-1 text-left">{balances[0]!.user.fullName}</div>
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
                    className="absolute left-[13px] top-4 -ml-px h-full w-px bg-gray-200 [:last-of-type>&]:hidden"
                    aria-hidden="true"
                  ></span>
                  <div className="relative flex items-center gap-x-2">
                    <div className="bg-gray-50 ring-[6px] ring-gray-50">
                      <Avatar
                        fallback={e.friend.fullName}
                        className="size-6"
                      />
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-800">{e.friend.fullName}</span>
                      {+e.amount < 0 ? (
                        <span className="text-gray-500"> lent you </span>
                      ) : (
                        <span className="text-gray-500"> borrowed </span>
                      )}
                      <Currency
                        currency={e.currency.uid}
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
