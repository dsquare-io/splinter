import { EnvelopeIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { eq } from '@tanstack/db';
import { useLiveQuery } from '@tanstack/react-db';
import { useNavigate } from '@tanstack/react-router';

import { ApiRoutes, urlWithArgs, type Friend } from '@/api-types';
import { axiosInstance } from '@/axios.ts';
import { emit } from '@/collections/events.ts';
import { outstandingBalances } from '@/collections/outstandingBalances.ts';
import { ActionButton } from '@/components/composites/ActionButton.tsx';
import { useDialog } from '@/components/primitives';

type FriendActionSectionProps = {
  friend: Friend;
};

export function FriendActionSection({ friend }: FriendActionSectionProps) {
  const { close } = useDialog();
  const navigate = useNavigate();
  const { data: balances } = useLiveQuery(
    (q) =>
      q
        .from({ balance: outstandingBalances.raw.collection })
        .where(({ balance }) => eq(balance.friendUid, friend.uid)),
    [friend.uid]
  );
  const hasBalance = balances.length > 0;

  return (
    <section className="mt-6">
      <h2 className="mb-2 block text-sm leading-relaxed font-bold text-gray-800">Actions</h2>
      <div className="-mx-2">
        {!friend.isActive && (
          <ActionButton
            onClick={async () => {
              await axiosInstance.post(urlWithArgs(ApiRoutes.FRIEND_INVITATION, { friendUid: friend.uid }));
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
            await axiosInstance.delete(urlWithArgs(ApiRoutes.FRIEND_DETAIL, { friendUid: friend.uid }));
            await emit('friend:mutated', { uid: friend.uid });
            await navigate({ to: '/friends' });
            close();
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
