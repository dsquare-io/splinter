import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';

import { GroupActivityTab } from './GroupActivityTab';
import { GroupBalancesTab } from './GroupBalancesTab';

export function GroupTabs({ group_uid }: { group_uid: string }) {
  return (
    <Tabs className="react-aria-Tabs">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50/70 backdrop-blur-sm">
        <TabList
          aria-label="Tabs"
          className="react-aria-TabList -mb-px flex cursor-default space-x-2"
        >
          <Tab id="activity">Activity</Tab>
          <Tab id="balance">Balances</Tab>
        </TabList>
      </div>
      <TabPanel id="activity">
        <GroupActivityTab group_uid={group_uid} />
      </TabPanel>
      <TabPanel id="balance">
        <GroupBalancesTab group_uid={group_uid} />
      </TabPanel>
    </Tabs>
  );
}
