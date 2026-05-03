import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { TextFormInput } from '@/components/form-controls/index.js';
import { useAuth } from '@/hooks/useAuth.ts';
import { AuthLayout } from './-layout';

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
        className="space-y-4"
      >
        <FormRootErrors />

        <TextFormInput
          required
          name="firstName"
          type="text"
          placeholder="Your first name"
          label="First Name"
        />

        <TextFormInput
          required
          name="lastName"
          type="text"
          placeholder="Your last name"
          label="Last Name"
        />

        <SubmitButton className="w-full">Setup Profile</SubmitButton>
      </Form>
    </AuthLayout>
  );
}
