import { useLiveQuery } from '@tanstack/react-db';

import { ApiRoutes, urlWithArgs } from '@/api-types';
import { friends as friendsEntity } from '@/collections/friends.ts';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { UserSelectFormInput } from '@/components/form-controls/UserSelectFormInput.tsx';
import { Button, DialogFooter, useDialog } from '@/components/primitives';
import { apiQueryOptions, useApiQuery } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';

type AddGroupMemberFormProps = {
  groupUid: string;
};

export function AddGroupMemberForm({ groupUid }: AddGroupMemberFormProps) {
  const { close } = useDialog();
  const { data: friends } = useLiveQuery((q) => q.from({ friend: friendsEntity.collection }));
  const {
    data: members,
    error: membersError,
    refetch: refetchMembers,
  } = useApiQuery(ApiRoutes.GROUP_MEMBERSHIP_LIST, { group_uid: groupUid });

  const friendsExcludingMembers = friends.filter((f) => !members?.find((m) => m.uid === f.uid));

  return (
    <>
      <ErrorAlert
        error={membersError}
        onRetry={() => refetchMembers()}
      />

      <Form
        method="POST"
        action={urlWithArgs(ApiRoutes.GROUP_MEMBERSHIP_LIST, { group_uid: groupUid })}
        onSubmitSuccess={async () => {
          await queryClient.invalidateQueries(
            apiQueryOptions(ApiRoutes.GROUP_DETAIL, { group_uid: groupUid })
          );
          close();
        }}
        className="mt-4 flex h-full flex-col space-y-4"
      >
        <FormRootErrors />

        <UserSelectFormInput
          required
          name="user"
          label="Select a friend to add"
          items={friendsExcludingMembers}
        />

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="plain"
            onPress={close}
            slot="form-action"
          >
            Cancel
          </Button>
          <SubmitButton>Add to Group</SubmitButton>
        </DialogFooter>
      </Form>
    </>
  );
}
