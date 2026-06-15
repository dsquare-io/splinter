import { ApiRoutes, urlWithArgs, type ExtendedGroup } from '@/api-types';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { UserSelectFormInput } from '@/components/form-controls/UserSelectFormInput.tsx';
import { Button, DialogFooter, useDialog } from '@/components/primitives';
import { apiQueryOptions, useApiQuery } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';

type AddGroupMemberFormProps = {
  group: ExtendedGroup;
};

export function AddGroupMemberForm({ group }: AddGroupMemberFormProps) {
  const { close } = useDialog();
  const { data: friends } = useApiQuery(ApiRoutes.FRIEND_LIST);

  const friendsExcludingMembers = friends?.filter((f) => !group?.members.find((m) => m.uid === f.uid));

  return (
    <>
      <Form
        method="POST"
        action={urlWithArgs(ApiRoutes.GROUP_MEMBERSHIP, { group_uid: group.uid })}
        onSubmitSuccess={() =>
          queryClient
            .invalidateQueries(apiQueryOptions(ApiRoutes.GROUP_DETAIL, { group_uid: group.uid }))
            .then(close)
        }
        className="mt-4 flex h-full flex-col space-y-4"
      >
        <FormRootErrors />

        <UserSelectFormInput
          required
          name="user"
          label="Select a friend to add"
          items={friendsExcludingMembers ?? []}
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
