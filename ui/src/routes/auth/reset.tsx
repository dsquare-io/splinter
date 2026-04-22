import { useState } from 'react';

import { Link, createFileRoute } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import {
  Alert,
  Button,
  FieldError,
  Form,
  FormRootErrors,
  Input,
  Label,
  TextFormField,
} from '@/components/common';

import AuthLayout from './-layout';

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
          className="space-y-6"
        >
          <FormRootErrors />

          <TextFormField
            name="password"
            required
          >
            <Label>New Password</Label>
            <Input
              type="password"
              placeholder="Enter new password"
            />
            <FieldError />
          </TextFormField>

          <TextFormField
            name="confirmPassword"
            required
          >
            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm new password"
            />
            <FieldError />
          </TextFormField>

          <Button
            className="w-full"
            slot="submit"
            type="submit"
          >
            Reset Password
          </Button>
        </Form>
      )}
    </AuthLayout>
  );
}
