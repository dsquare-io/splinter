import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';

import { ApiRoutes } from '@/api-types';
import { ExpenseList } from '@/features/ExpenseList';
import { GroupBalancesTab } from './GroupBalancesTab';

export function GroupTabs({ group_uid }: { group_uid: string }) {
  return (
    <Tabs className="react-aria-Tabs">
      <div
        className="sticky z-10 border-b border-gray-200 bg-gray-50/70 backdrop-blur-sm"
        style={{ top: 'var(--shrink-layout-header-height, 0px)' }}
      >
        <TabList
          aria-label="Tabs"
          className="react-aria-TabList -mb-px flex cursor-default space-x-2"
        >
          <Tab id="activity">Activity</Tab>
          <Tab id="balance">Balances</Tab>
        </TabList>
      </div>
      <TabPanel id="activity">
        <ExpenseList
          apiPath={ApiRoutes.GROUP_EXPENSE_LIST}
          args={{ group_uid }}
          detailRoute="/groups/$group/$expense"
          detailRouteParams={{ group: group_uid }}
        />
      </TabPanel>
      <TabPanel id="balance">
        <GroupBalancesTab group_uid={group_uid} />
      </TabPanel>
    </Tabs>
  );
}
