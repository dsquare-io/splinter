import { ApiRoutes, urlWithArgs } from '@/api-types';
import { FieldError, Form, FormRootErrors, SubmitButton, TextFormField } from '@/components/form';
import { Input, Label, useDialog } from '@/components/primitives';
import { apiQueryOptions } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';

type GroupNameFormProps = {
  group_uid: string;
  groupName?: string;
};

export function GroupNameForm({ group_uid, groupName }: GroupNameFormProps) {
  const { close } = useDialog();

  return (
    <Form
      values={{ name: groupName }}
      method="PATCH"
      action={urlWithArgs(ApiRoutes.GROUP_DETAIL, { group_uid })}
      onSubmitSuccess={() =>
        queryClient.invalidateQueries(apiQueryOptions(ApiRoutes.GROUP_DETAIL, { group_uid })).then(close)
      }
      className="mt-4"
    >
      <FormRootErrors />

      <TextFormField
        required
        name="name"
      >
        <Label>Group Name</Label>
        <div className="relative flex items-stretch -space-x-px">
          <Input
            type="text"
            className="relative rounded-r-none hover:z-10 focus:z-10"
            placeholder="i.e., Trip, Homies"
          />
          <SubmitButton
            className="rounded-l-none"
            variant="outlined"
          >
            Update
          </SubmitButton>
        </div>
        <FieldError />
      </TextFormField>
    </Form>
  );
}
