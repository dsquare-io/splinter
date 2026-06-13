import { ApiRoutes } from '@/api-types';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { TextFormInput } from '@/components/form-controls';
import { Button, DialogFooter, useDialog } from '@/components/primitives';
import { apiQueryOptions } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';

export function AddFriendForm() {
  const { close } = useDialog();

  return (
    <Form
      className="mt-4 flex h-full flex-col space-y-4"
      action={ApiRoutes.FRIEND_LIST}
      onSubmitSuccess={() =>
        queryClient.invalidateQueries(apiQueryOptions(ApiRoutes.FRIEND_LIST)).then(close)
      }
      transformData={({ email, name }: { email: string; name: string }) => ({
        email,
        name: name || email.split('@')[0],
      })}
    >
      <FormRootErrors />

      <TextFormInput
        autoFocus
        required
        name="email"
        type="email"
        label="Email"
        placeholder="Your friend's email address"
      />

      <TextFormInput
        name="name"
        type="text"
        label="Name"
        placeholder="Your friend's name"
        description="Only needed if your friend hasn't joined yet"
      />

      <DialogFooter className="flex justify-end gap-2">
        <Button
          variant="plain"
          onPress={close}
          slot="form-action"
        >
          Cancel
        </Button>
        <SubmitButton>Invite Friend</SubmitButton>
      </DialogFooter>
    </Form>
  );
}
