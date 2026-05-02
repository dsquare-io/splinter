import type { ComponentProps } from 'react';

import { Dialog, DialogHeader } from '@/components/primitives';
import { AddGroupMemberForm } from './AddGroupMemberForm.tsx';

export function AddGroupMemberDialog(props: ComponentProps<typeof AddGroupMemberForm>) {
  return (
    <Dialog>
      <DialogHeader
        title="Addd Group Member"
        description="Add your friends to share expenses in this group."
      />
      <AddGroupMemberForm {...props} />
    </Dialog>
  );
}
