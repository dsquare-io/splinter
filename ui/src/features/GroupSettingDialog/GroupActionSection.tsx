import { ArrowRightStartOnRectangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from '@tanstack/react-router';

import { ApiRoutes, urlWithArgs, type SimpleGroup } from '@/api-types';
import { axiosInstance } from '@/axios.ts';
import { emit } from '@/collections/events.ts';
import { ActionButton } from '@/components/composites/ActionButton.tsx';
import { useDialog } from '@/components/primitives';
import { useAuth } from '@/hooks/useAuth.ts';

type GroupActionsSectionProps = {
  group: SimpleGroup;
  currentUserHasBalance: boolean;
};

export function GroupActionSection({ group, currentUserHasBalance: hasBalance }: GroupActionsSectionProps) {
  const { currentUser } = useAuth();
  const { close } = useDialog();
  const navigate = useNavigate();

  return (
    <section className="mt-6">
      <h2 className="mb-2 block text-sm leading-relaxed font-bold text-gray-800">Group Settings</h2>
      <div className="-mx-2">
        <ActionButton
          isDisabled={hasBalance}
          onClick={async () => {
            await axiosInstance.delete(
              urlWithArgs(ApiRoutes.GROUP_MEMBERSHIP_DETAIL, {
                groupUid: group.uid,
                memberUid: currentUser!.uid,
              })
            );
            await emit('group:mutated', { uid: group.uid });
            await navigate({ to: '/groups' });
            close();
          }}
          confirmation={{
            title: 'Leave Group',
            actionLabel: 'Leave Group',
            description: (
              <>
                Are you sure you want to leave <span className="font-medium text-gray-800">{group.name}</span>
                ? This action cannot be undone.
              </>
            ),
          }}
          IconComponent={ArrowRightStartOnRectangleIcon}
        >
          <div className="text-left">
            <div className="text-gray-800">Leave Group</div>
            {hasBalance && (
              <div className="text-xs text-neutral-600">
                Please settle up your outstanding balances first.
              </div>
            )}
          </div>
        </ActionButton>
        <ActionButton
          color="danger"
          onClick={async () => {
            await axiosInstance.delete(
              urlWithArgs(ApiRoutes.GROUP_DETAIL, {
                groupUid: group.uid,
              })
            );
            await emit('group:mutated', { uid: group.uid });
            await navigate({ to: '/groups' });
            close();
          }}
          confirmation={{
            title: 'Delete Group',
            actionLabel: 'Delete Group',
            description: (
              <>
                Are you sure you want to delete{' '}
                <span className="font-medium text-gray-800">{group.name}</span>? This action cannot be undone.
              </>
            ),
          }}
          IconComponent={TrashIcon}
        >
          <div>Delete Group</div>
        </ActionButton>
      </div>
    </section>
  );
}
