import { Form, Button, TextField } from '@components/common';
import { createFileRoute } from '@tanstack/react-router';
import { ApiRoutes } from '../../api-types';
import AuthLayout from './-layout.tsx';

export const Route = createFileRoute('/auth/login')({
  component: RootComponent,
});

function RootComponent() {
  return (
    <AuthLayout>
      <Form
        action={ApiRoutes.AUTHENTICATE_USER}
        method="POST"
        className="space-y-6"
      >
        <TextField name="email" type="email" isRequired label="Email"/>
        <TextField name="password" type="password" isRequired label="Password"/>

        <Button className="w-full" slot="submit" type="submit">Submit</Button>
      </Form>
    </AuthLayout>
  );
}