import { Dialog, DialogHeader } from '@/components/primitives';
import { CreateGroupForm } from './CreateGroupForm.tsx';

type CreateGroupModalProps = {
  onOpenChange?: (open: boolean) => void;
};

export function CreateGroupDialog({ onOpenChange }: CreateGroupModalProps) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogHeader
        title="Create Group"
        description="Organize shared expenses with friends or colleagues."
      />
      <CreateGroupForm />
    </Dialog>
  );
}
