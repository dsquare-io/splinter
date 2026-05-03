import { ApiRoutes } from '@/api-types';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { TextFormInput } from '@/components/form-controls/index.js';

export default function ChangePassword() {
  return (
    <Form
      action={ApiRoutes.CHANGE_PASSWORD}
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
        return { oldPassword, password };
      }}
      onSubmitSuccess={(_, formRef) => {
        formRef.reset();
      }}
      className="space-y-4 md:col-span-2"
    >
      <FormRootErrors />

      <TextFormInput
        required
        name="oldPassword"
        type="password"
        autoComplete="current-password"
        placeholder="You old password"
        label="Old Password"
      />

      <TextFormInput
        required
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter your new password"
        label="Password"
      />

      <TextFormInput
        required
        name="password2"
        type="password"
        autoComplete="new-password"
        placeholder="Confirm your password"
        label="Confirm Password"
      />

      <SubmitButton className="mt-8">Change Password</SubmitButton>
    </Form>
  );
}
