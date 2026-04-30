import { Dialog, DialogHeader } from '@/components/primitives';
import { AddFriendForm } from './AddFriendForm.tsx';

export function AddFriendModal({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogHeader
        title="Invite Friend"
        description="Add by email — we'll send an invite if they haven't joined yet"
      />
      <AddFriendForm />
    </Dialog>
  );
}
