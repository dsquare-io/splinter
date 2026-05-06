import type { Friend } from '@/api-types';
import { Avatar, Dialog, DialogHeader } from '@/components/primitives';
import { FriendActionSection } from './FriendActionSection.tsx';

type FriendSettingsDialogProps = {
  friend: Friend;
};

export function FriendSettingDialog({ friend }: FriendSettingsDialogProps) {
  return (
    <Dialog>
      <DialogHeader title="Friend Settings" />
      <div className="flex items-center gap-x-3">
        <Avatar
          fallback={friend.name}
          className="size-10 shrink-0"
        />
        <div className="min-w-0">
          <div className="truncate font-medium text-gray-900">{friend.name}</div>
          <div className="truncate text-sm text-gray-500">{friend.email}</div>
        </div>
      </div>
      <FriendActionSection friend={friend} />
    </Dialog>
  );
}
