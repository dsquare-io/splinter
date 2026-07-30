import { useLiveQuery } from '@tanstack/react-db';
import { useNavigate } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { emit } from '@/collections/events.ts';
import { friends as friendsEntity } from '@/collections/friends.ts';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { TextFormInput } from '@/components/form-controls';
import { UserSelectFormInput } from '@/components/form-controls/UserSelectFormInput.tsx';
import { Button, DialogFooter, useDialog } from '@/components/primitives';

export function CreateGroupForm() {
  const { close } = useDialog();
  const { data: friends } = useLiveQuery((q) => q.from({ friend: friendsEntity.collection }));
  const navigate = useNavigate();

  return (
    <Form
      method="POST"
      action={ApiRoutes.GROUP_LIST}
      defaultValues={{ members: [] }}
      onSubmitSuccess={async (response) => {
        await emit('group:mutated', { uid: response.data.uid! });
        await navigate({
          to: `/groups/$group`,
          params: { group: response.data.uid! },
        });
        close();
      }}
      className="mt-4 flex h-full flex-col space-y-4"
    >
      <FormRootErrors />

      <TextFormInput
        required
        name="name"
        label="Group Name"
        placeholder="i.e., Trip, Homies"
      />
      <UserSelectFormInput
        name="members"
        label="Members"
        selectionMode="multiple"
        items={friends}
        minLength={{
          value: 1,
          message: 'Please select at least one friend',
        }}
      />
      <DialogFooter className="flex justify-end gap-2">
        <Button
          variant="plain"
          size="small"
          onPress={close}
          slot="form-action"
        >
          Cancel
        </Button>
        <SubmitButton>Create Group</SubmitButton>
      </DialogFooter>
    </Form>
  );
}
