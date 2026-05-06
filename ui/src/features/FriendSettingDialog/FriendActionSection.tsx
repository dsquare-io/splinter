import { EnvelopeIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from '@tanstack/react-router';

import { ApiRoutes, urlWithArgs, type Friend } from '@/api-types';
import { axiosInstance } from '@/axios.ts';
import { ActionButton } from '@/components/composites/ActionButton.tsx';
import { apiQueryOptions } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';

type FriendActionSectionProps = {
  friend: Friend;
};

export function FriendActionSection({ friend }: FriendActionSectionProps) {
  const navigate = useNavigate();
  const hasBalance = false; // friend.outstandingBalances.length > 0;

  return (
    <section className="mt-6">
      <h2 className="mb-2 block text-sm leading-relaxed font-bold text-gray-800">Actions</h2>
      <div className="-mx-2">
        {!friend.isActive && (
          <ActionButton
            onClick={async () => {
              await axiosInstance.post(urlWithArgs(ApiRoutes.FRIEND_INVITATION, { friend_uid: friend.uid }));
            }}
            doneMessage={`Invite sent to ${friend.name}`}
            IconComponent={EnvelopeIcon}
          >
            <div className="text-left">
              <div className="text-gray-800">Resend Invite</div>
              <div className="text-xs text-neutral-600">Send invitation email again</div>
            </div>
          </ActionButton>
        )}

        <ActionButton
          color="danger"
          onClick={async () => {
            await axiosInstance.delete(urlWithArgs(ApiRoutes.FRIEND_DETAIL, { friend_uid: friend.uid }));
            await queryClient.invalidateQueries(apiQueryOptions(ApiRoutes.FRIEND_LIST));
            await navigate({ to: '/friends' });
          }}
          isDisabled={hasBalance}
          doneMessage={`Invite sent to ${friend.name}`}
          IconComponent={UserMinusIcon}
          confirmation={{
            title: 'Remove Friend',
            actionLabel: 'Remove Friend',
            description: (
              <>
                Are you sure you want to remove{' '}
                <span className="font-medium text-gray-800">{friend.name}</span> as a friend?
              </>
            ),
          }}
        >
          <div className="text-left">
            <div>Remove Friend</div>
            {hasBalance && (
              <div className="text-xs text-neutral-600">
                Please settle up your outstanding balances first.
              </div>
            )}
          </div>
        </ActionButton>
      </div>
    </section>
  );
}
