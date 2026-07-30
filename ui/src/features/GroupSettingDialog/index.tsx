import { useMemo } from 'react';

import groupBy from 'just-group-by';

import { ApiRoutes, type Group } from '@/api-types';
import { Dialog, DialogHeader } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { GroupActionSection } from './GroupActionSection.tsx';
import { GroupMemberSection } from './GroupMemberSection.tsx';
import { GroupNameForm } from './GroupNameForm';

type GroupSettingDialogProps = {
  group: Group;
};

export function GroupSettingDialog({ group }: GroupSettingDialogProps) {
  const { data: balances } = useApiQuery(ApiRoutes.GROUP_OUTSTANDING_BALANCE, { group_uid: group.uid });

  const balanceByUsers = useMemo(() => groupBy(balances ?? [], (balance) => balance.user), [balances]);

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
