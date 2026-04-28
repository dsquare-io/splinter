import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { Button } from '@/components/common';
import { FieldError, Form, FormRootErrors, Input, Label, TextFormField } from '@/components/form';
import useAuth from '@/hooks/useAuth.ts';
import AuthLayout from './-layout';

export const Route = createFileRoute('/auth/setup')({
  component: RootComponent,
});

function RootComponent() {
  const { currentUser, refetchProfile } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return;

  return (
    <AuthLayout title="Setup your account">
      <Form
        action={ApiRoutes.PROFILE}
        values={currentUser}
        method="PUT"
        onSubmitSuccess={async () => {
          await refetchProfile();
          return navigate({ to: '/friends' });
        }}
        className="space-y-6"
      >
        <FormRootErrors />

        <TextFormField
          name="firstName"
          required
        >
          <Label>First Name</Label>
          <Input
            type="text"
            placeholder="Your first name"
          />
          <FieldError />
        </TextFormField>

        <TextFormField
          name="lastName"
          required
        >
          <Label>Last Name</Label>
          <Input
            type="text"
            placeholder="Your last name"
          />
          <FieldError />
        </TextFormField>

        <Button
          className="w-full"
          slot="submit"
          type="submit"
        >
          Setup Profile
        </Button>
      </Form>
    </AuthLayout>
  );
}
