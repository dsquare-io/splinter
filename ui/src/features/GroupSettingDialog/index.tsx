import { eq } from '@tanstack/db';
import { useLiveQuery } from '@tanstack/react-db';

import type { SimpleGroup } from '@/api-types';
import { outstandingBalances } from '@/collections/outstandingBalances.ts';
import { Dialog, DialogHeader } from '@/components/primitives';
import { GroupActionSection } from './GroupActionSection.tsx';
import { GroupMemberSection } from './GroupMemberSection.tsx';
import { GroupNameForm } from './GroupNameForm';

type GroupSettingDialogProps = {
  group: SimpleGroup;
};

export function GroupSettingDialog({ group }: GroupSettingDialogProps) {
  const { data: balances } = useLiveQuery(
    (q) =>
      q
        .from({ balance: outstandingBalances.raw.collection })
        .where(({ balance }) => eq(balance.groupUid, group.uid)),
    [group.uid]
  );
  const currentUserHasBalance = balances.length > 0;

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
