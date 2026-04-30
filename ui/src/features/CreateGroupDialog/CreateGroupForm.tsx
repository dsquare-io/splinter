import { useNavigate } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { Friend } from '@/api-types/components/schemas';
import { Form } from '@/components/form';
import { SelectFormInput, TextFormInput } from '@/components/form-controls';
import { Avatar, Button, useDialog } from '@/components/primitives';
import { apiQueryOptions, useApiQuery } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';

export function CreateGroupForm() {
  const { close } = useDialog();
  const { data: friends } = useApiQuery(ApiRoutes.FRIEND_LIST);
  const navigate = useNavigate();

  return (
    <Form
      method="POST"
      action={ApiRoutes.GROUP_LIST}
      defaultValues={{ members: [] }}
      onSubmitSuccess={(res) =>
        queryClient
          .invalidateQueries(apiQueryOptions(ApiRoutes.GROUP_LIST))
          .then(() =>
            navigate({
              to: `/groups/$group`,
              params: { group: res.data.uid! },
            })
          )
          .then(close)
      }
      className="space-y-4"
    >
      <TextFormInput
        required
        name="name"
        label="Group Name"
        placeholder="i.e., Trip, Homies"
      />
      <SelectFormInput<Friend>
        name="members"
        label="Members"
        selectionMode="multiple"
        placeholder="Select friends..."
        emptyStateMessage="No friends found"
        items={friends?.results ?? []}
        minLength={{
          value: 1,
          message: 'Please select at least one friend',
        }}
        ItemComponent={({ item }) => (
          <>
            <Avatar
              className="size-6 bg-neutral-50"
              fallback={item.name}
            />
            {item.name}
          </>
        )}
      />
      <div className="-mx-4 flex justify-end gap-2 px-4 pt-4 sm:-mx-6 sm:px-6">
        <Button
          variant="plain"
          size="small"
          onPress={close}
          slot="form-action"
        >
          Cancel
        </Button>
        <Button type="submit">Create Group</Button>
      </div>
    </Form>
  );
}
