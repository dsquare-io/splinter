import { useState } from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { TextFormInput } from '@/components/form-controls/index.js';
import { Alert } from '@/components/primitives';
import { AuthLayout } from './-layout';

export const Route = createFileRoute('/auth/reset')({
  validateSearch: (search) => ({
    uid: String(search.uid ?? ''),
    token: String(search.token ?? ''),
  }),
  component: RootComponent,
});

function RootComponent() {
  const { uid, token } = Route.useSearch();
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthLayout title="Reset your password">
      {submitted ? (
        <Alert
          color="success"
          title="Password reset successful"
          body={
            <Link
              className="text-green-700 underline underline-offset-2 hover:text-green-900"
              to="/auth/login"
            >
              Back to login
            </Link>
          }
          dismissible={false}
        />
      ) : (
        <Form
          action={ApiRoutes.RESET_PASSWORD}
          method="POST"
          transformData={(
            {
              password,
              confirmPassword,
            }: {
              password: string;
              confirmPassword: string;
            },
            formRef
          ) => {
            if (password !== confirmPassword) {
              formRef.setError('confirmPassword', {
                message: 'Password Mismatch',
              });
              return undefined;
            }
            return { password, uid, token };
          }}
          onSubmitSuccess={() => setSubmitted(true)}
          className="space-y-4"
        >
          <FormRootErrors />

          <TextFormInput
            required
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your new password"
            label="New Password"
          />

          <TextFormInput
            required
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            label="Confirm Password"
          />

          <SubmitButton className="w-full">Reset Password</SubmitButton>
        </Form>
      )}
    </AuthLayout>
  );
}
