import { XMarkIcon } from '@heroicons/react/24/outline';

import { ApiRoutes, GroupOutstandingBalance, SimpleUser, urlWithArgs, type ExtendedGroup } from '@/api-types';
import { axiosInstance } from '@/axios.ts';
import { Avatar, IconButton } from '@/components/primitives';
import { apiQueryOptions } from '@/hooks/useApiQuery.ts';
import { useConfirmation } from '@/hooks/useConfirmation.ts';
import { queryClient } from '@/queryClient.ts';

type GroupMembersSectionProps = {
  group: ExtendedGroup;
  balanceByUsers: Record<string, GroupOutstandingBalance[]>;
};

export function GroupMemberSection({ group, balanceByUsers }: GroupMembersSectionProps) {
  const confirm = useConfirmation();

  async function removeMember(member: SimpleUser) {
    return confirm({
      title: 'Remove Member',
      description: (
        <>
          Are you sure you want to remove <span className="font-medium text-gray-800">{member.name}</span>{' '}
          from this group? This action cannot be undone.
        </>
      ),
      callback: async () => {
        await axiosInstance.delete(
          urlWithArgs(ApiRoutes.GROUP_MEMBERSHIP_DETAIL, {
            group_uid: group.uid,
            member_uid: member.uid,
          })
        );
        return queryClient.invalidateQueries(
          apiQueryOptions(ApiRoutes.GROUP_DETAIL, { group_uid: group.uid })
        );
      },
    });
  }

  return (
    <section className="mt-6">
      <h2 className="block text-sm leading-relaxed font-bold text-gray-800">Group Members</h2>
      <p className="mb-2 text-sm text-neutral-500">
        Members with outstanding balances can't be removed from group
      </p>
      <div>
        {group.members.map((member) => (
          <div
            key={member.uid}
            className="flex items-center gap-x-3 py-2"
          >
            <Avatar
              fallback={member.name}
              className="size-8"
            />
            <div className="flex-1 -space-y-0.5 text-neutral-800">
              <div>{member.name}</div>
              {!member.isActive && <div className="text-sm text-neutral-500">Inactive</div>}
            </div>
            {!balanceByUsers[member.uid]?.length && (
              <IconButton
                type="button"
                variant="plain"
                onClick={() => removeMember(member)}
              >
                <XMarkIcon className="size-4 text-neutral-800" />
              </IconButton>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
