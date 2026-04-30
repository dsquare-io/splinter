import { ArrowRightStartOnRectangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useNavigate } from '@tanstack/react-router';

import { ApiRoutes, GroupOutstandingBalance, urlWithArgs, type ExtendedGroup } from '@/api-types';
import { axiosInstance } from '@/axios.ts';
import { Button } from '@/components/primitives';
import { apiQueryOptions } from '@/hooks/useApiQuery.ts';
import { useAuth } from '@/hooks/useAuth.ts';
import { useConfirmation } from '@/hooks/useConfirmation.ts';
import { queryClient } from '@/queryClient.ts';

type GroupActionsSectionProps = {
  group: ExtendedGroup;
  balanceByUsers: Record<string, GroupOutstandingBalance[]>;
};

export function GroupActionsSection({ group, balanceByUsers }: GroupActionsSectionProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirmation();

  const hasBalance = !!balanceByUsers[currentUser?.uid ?? '']?.length;

  async function leaveGroup() {
    return confirm({
      title: 'Leave Group',
      actionLabel: 'Leave Group',
      description: (
        <>
          Are you sure you want to leave <span className="font-medium text-gray-800">{group.name}</span>? This
          action cannot be undone.
        </>
      ),
      callback: async () => {
        await axiosInstance.delete(
          urlWithArgs(ApiRoutes.GROUP_MEMBERSHIP_DETAIL, {
            group_uid: group.uid,
            member_uid: currentUser!.uid,
          })
        );
        await queryClient.invalidateQueries(
          apiQueryOptions(ApiRoutes.GROUP_DETAIL, { group_uid: group.uid })
        );
        await queryClient.invalidateQueries(apiQueryOptions(ApiRoutes.GROUP_LIST));

        return navigate({ to: '/groups' });
      },
    });
  }

  async function deleteGroup() {
    return confirm({
      title: 'Delete Group',
      actionLabel: 'Delete Group',
      description: (
        <>
          Are you sure you want to delete <span className="font-medium text-gray-800">{group.name}</span>?
          This action cannot be undone.
        </>
      ),
      callback: async () => {
        await axiosInstance.delete(
          urlWithArgs(ApiRoutes.GROUP_DETAIL, {
            group_uid: group.uid,
          })
        );
        await queryClient.invalidateQueries(apiQueryOptions(ApiRoutes.GROUP_LIST));
        return navigate({ to: '/groups' });
      },
    });
  }

  return (
    <section className="mt-6">
      <h2 className="mb-2 block text-sm leading-relaxed font-bold text-gray-800">Group Settings</h2>
      <div className="-mx-2">
        <Button
          type="button"
          isDisabled={hasBalance}
          variant="plain"
          onClick={leaveGroup}
          className="flex w-full justify-start gap-x-4"
        >
          <ArrowRightStartOnRectangleIcon className="size-5!" />
          <div className="text-left">
            <div className="text-gray-800">Leave Group</div>
            {hasBalance && (
              <div className="text-xs text-neutral-600">
                Please settle up your outstanding balances first.
              </div>
            )}
          </div>
        </Button>
        <Button
          type="button"
          variant="plain"
          color="danger"
          className="w-full justify-start gap-x-3"
          onClick={deleteGroup}
        >
          <TrashIcon className="size-5!" />
          <div>Delete Group</div>
        </Button>
      </div>
    </section>
  );
}
