import {Fragment} from 'react';

import * as Accordion from '@radix-ui/react-accordion';
import groupBy from 'just-group-by';

import {ApiRoutes} from '@/api-types';
import Currency from '@/components/Currency.tsx';
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
    <Accordion.Root type="multiple" defaultValue={[profileData.uid]}>
      {balanceByUsers.map(([userId, balances]) => (
        <Accordion.Item
          key={userId}
          value={userId}
        >
          <Accordion.Trigger>{balances[0]!.user.fullName}</Accordion.Trigger>
          <Accordion.Content>
            {balances.map((e) => (
              <Fragment key={e.friend?.uid ?? e.currency.uid}>
                <p>
                  {+e.amount > 0 && <>{e.friend.fullName} borrowed </>}
                  {+e.amount < 0 && <>{e.friend.fullName} lent you </>}
                  <Currency
                    currency={e.currency.uid}
                    value={e.amount}
                  />
                </p>
              </Fragment>
            ))}
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
