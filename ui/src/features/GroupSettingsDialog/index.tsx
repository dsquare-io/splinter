import { useMemo } from 'react';

import groupBy from 'just-group-by';

import type { ExtendedGroup } from '@/api-types';
import { Dialog, DialogHeader } from '@/components/primitives';
import { GroupActionsSection } from './GroupActionsSection';
import { GroupMembersSection } from './GroupMembersSection';
import { GroupNameForm } from './GroupNameForm';

type GroupSettingsDialogProps = {
  group: ExtendedGroup;
};

export function GroupSettingsDialog({ group }: GroupSettingsDialogProps) {
  const balanceByUsers = useMemo(
    () => groupBy(group.outstandingBalances, (balance) => balance.user.uid),
    [group.outstandingBalances]
  );

  return (
    <Dialog>
      <DialogHeader title="Group Settings" />
      <GroupNameForm
        group_uid={group.uid}
        groupName={group.name}
      />
      <GroupMembersSection
        group={group}
        balanceByUsers={balanceByUsers}
      />
      <GroupActionsSection
        group={group}
        balanceByUsers={balanceByUsers}
      />
    </Dialog>
  );
}
