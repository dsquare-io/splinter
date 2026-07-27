import { useLiveQuery } from '@tanstack/react-db';

import type { Group } from '@/api-types';
import { outstandingBalancesCollection } from '@/collections/outstandingBalancesCollection.ts';
import { Dialog, DialogHeader } from '@/components/primitives';
import { GroupActionSection } from './GroupActionSection.tsx';
import { GroupMemberSection } from './GroupMemberSection.tsx';
import { GroupNameForm } from './GroupNameForm';

type GroupSettingDialogProps = {
  group: Group;
};

export function GroupSettingDialog({ group }: GroupSettingDialogProps) {
  const { data: balances } = useLiveQuery((q) => q.from({ balance: outstandingBalancesCollection }));
  // The API only tells us the current user's own balance now — not the full
  // member-to-member matrix — so this is a coarse "does the current user have any
  // outstanding balance in this group" flag, not a per-member check.
  const currentUserHasBalance = balances.some((b) => b.group === group.uid);

  return (
    <Dialog>
      <DialogHeader title="Group Settings" />
      <GroupNameForm
        group_uid={group.uid}
        groupName={group.name}
      />
      <GroupMemberSection
        group={group}
        currentUserHasBalance={currentUserHasBalance}
      />
      <GroupActionSection
        group={group}
        currentUserHasBalance={currentUserHasBalance}
      />
    </Dialog>
  );
}
