import {Paths} from '@/api-types/routePaths.ts';
import {Button, FieldError, Form, FormRootErrors, Input, Label, TextFormField} from '@/components/common';

export default function ChangePassword() {
  return (
    <Form
      action={Paths.CHANGE_PASSWORD}
      transformData={(
        {
          oldPassword,
          password,
          password2,
        }: {
          oldPassword: string;
          password: string;
          password2: string;
        },
        formRef
      ) => {
        if (password !== password2) {
          formRef.setError('password2', {
            message: 'Password Mismatch',
          });
          return undefined;
        }
        return {oldPassword, password};
      }}
      onSubmitSuccess={(_, formRef) => {
        formRef.reset();
      }}
      className="md:col-span-2"
    >
      <FormRootErrors />

      <div className="space-y-6">
        <TextFormField
          name="oldPassword"
          required
        >
          <Label>Old Password</Label>
          <Input
            type="password"
            placeholder="You old password"
            autoComplete="current-password"
          />
          <FieldError />
        </TextFormField>

        <TextFormField
          name="password"
          required
        >
          <Label>Password</Label>
          <Input
            type="password"
            placeholder="Your new password"
            autoComplete="new-password"
          />
          <FieldError />
        </TextFormField>

        <TextFormField
          name="password2"
          required
        >
          <Label>Password again</Label>
          <Input
            type="password"
            placeholder="Your new password again"
            autoComplete="new-password"
          />
          <FieldError />
        </TextFormField>
      </div>

      <Button
        className="mt-8"
        slot="submit"
        type="submit"
      >
        Change Password
      </Button>
    </Form>
  );
}
