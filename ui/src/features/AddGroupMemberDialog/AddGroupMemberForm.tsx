import { ApiRoutes, urlWithArgs, type ExtendedGroup, type SimpleUser } from '@/api-types';
import { Form } from '@/components/form';
import { SelectFormInput } from '@/components/form-controls';
import { Avatar, Button, useDialog } from '@/components/primitives';
import { apiQueryOptions, useApiQuery } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';

type AddGroupMemberFormProps = {
  group: ExtendedGroup;
};

export function AddGroupMemberForm({ group }: AddGroupMemberFormProps) {
  const { close } = useDialog();
  const { data: friends } = useApiQuery(ApiRoutes.FRIEND_LIST);

  const friendsExcludingMembers = friends?.results?.filter(
    (f) => !group?.members.find((m) => m.uid === f.uid)
  );

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
        className="space-y-4"
      >
        <SelectFormInput<SimpleUser>
          name="user"
          items={friendsExcludingMembers ?? []}
          label="Select a friend to add"
          ItemComponent={({ item }) => (
            <>
              <Avatar
                className="size-6 bg-white"
                fallback={item.name}
              />
              <div className="flex-1">
                <div>{item.name}</div>
                {!item.isActive && <div className="text-xs text-gray-600">Inactive</div>}
              </div>
            </>
          )}
        />

        <div className="-mx-4 flex justify-end gap-2 px-4 pt-4 sm:-mx-6 sm:px-6">
          <Button
            variant="plain"
            onPress={close}
            slot="form-action"
          >
            Cancel
          </Button>
          <Button type="submit">Add to Group</Button>
        </div>
      </Form>
    </>
  );
}
