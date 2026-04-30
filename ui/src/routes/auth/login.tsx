import { createFileRoute, Link } from '@tanstack/react-router';

import { ApiRoutes } from '@/api-types';
import { Form, FormRootErrors } from '@/components/form';
import { TextFormInput } from '@/components/form-controls/index.js';
import { Button } from '@/components/primitives';
import { useAuth } from '@/hooks/useAuth';
import { AuthLayout } from './-layout';

export const Route = createFileRoute('/auth/login')({
  component: RootComponent,
});

function RootComponent() {
  const { setToken } = useAuth();

  return (
    <AuthLayout title="Sign in to your account">
      <Form
        action={ApiRoutes.PASSWORD_LOGIN}
        method="POST"
        onSubmitSuccess={(res) => {
          setToken({ access: res.data.accessToken, refresh: res.data.refreshToken });
          window.location.href = '/friends';
        }}
        className="space-y-4"
      >
        <FormRootErrors />

        <TextFormInput
          required
          name="username"
          type="text"
          placeholder="Enter your username"
          label="Username"
        />

        <TextFormInput
          required
          name="password"
          type="password"
          placeholder="Enter your password"
          label="Password"
        />

        <Link
          className="text-brand-600 hover:text-brand-700 mb-1 inline-flex items-center gap-x-1.5 pb-4 text-sm font-medium"
          to="/auth/forget"
        >
          Forget Password?
        </Link>

        <Button
          className="w-full"
          slot="submit"
          type="submit"
        >
          Login
        </Button>
      </Form>
    </AuthLayout>
  );
}
