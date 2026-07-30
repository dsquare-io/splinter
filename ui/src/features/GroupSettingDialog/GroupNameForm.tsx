import { ApiRoutes, urlWithArgs } from '@/api-types';
import { emit } from '@/collections/events.ts';
import { FieldError, Form, FormRootErrors, SubmitButton, TextFormField } from '@/components/form';
import { Input, Label, useDialog } from '@/components/primitives';

type GroupNameFormProps = {
  groupUid: string;
  groupName?: string;
};

export function GroupNameForm({ groupUid, groupName }: GroupNameFormProps) {
  const { close } = useDialog();

  return (
    <Form
      values={{ name: groupName }}
      method="PATCH"
      action={urlWithArgs(ApiRoutes.GROUP_DETAIL, { groupUid })}
      onSubmitSuccess={async () => {
        await emit('group:mutated', { uid: groupUid });
        close();
      }}
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
