import { useState } from 'react';

import { createFileRoute, Link } from '@tanstack/react-router';

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

export const Route = createFileRoute('/auth/forget')({
  component: RootComponent,
});

function RootComponent() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AuthLayout title="We'll help you reset your password.">
      {submitted ? (
        <Alert
          color="success"
          title="Check your email"
          body="We've sent you a link to reset your password."
          dismissible={false}
        />
      ) : (
        <Form
          action={ApiRoutes.FORGET_PASSWORD}
          method="POST"
          onSubmitSuccess={() => setSubmitted(true)}
          className="space-y-6"
        >
          <FormRootErrors />

          <TextFormField
            name="email"
            required
          >
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
            />
            <FieldError />
          </TextFormField>

          <Button
            className="w-full"
            slot="submit"
            type="submit"
          >
            Send verification email
          </Button>

          <Link
            className="text-brand-600 hover:text-brand-700 mb-1 inline-flex items-center gap-x-1.5 pb-4 text-sm font-medium"
            to="/auth/login"
          >
            Back to login
          </Link>
        </Form>
      )}
    </AuthLayout>
  );
}
