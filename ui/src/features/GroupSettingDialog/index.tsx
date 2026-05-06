import { useMemo } from 'react';

import groupBy from 'just-group-by';

import type { ExtendedGroup } from '@/api-types';
import { Dialog, DialogHeader } from '@/components/primitives';
import { GroupActionSection } from './GroupActionSection.tsx';
import { GroupMemberSection } from './GroupMemberSection.tsx';
import { GroupNameForm } from './GroupNameForm';

type GroupSettingDialogProps = {
  group: ExtendedGroup;
};

export function GroupSettingDialog({ group }: GroupSettingDialogProps) {
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
      <GroupMemberSection
        group={group}
        balanceByUsers={balanceByUsers}
      />
      <GroupActionSection
        group={group}
        balanceByUsers={balanceByUsers}
      />
    </Dialog>
  );
}
