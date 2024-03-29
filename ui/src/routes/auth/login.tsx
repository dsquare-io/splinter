import {createFileRoute, useNavigate} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import {setHeaders} from '@/axios';
import {Button, FieldError, Form, FormRootErrors, Input, Label, TextFormField} from '@/components/common';
import useAuth from '@/hooks/useAuth';

import AuthLayout from './-layout';

export const Route = createFileRoute('/auth/login')({
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const {setToken} = useAuth();

  return (
    <AuthLayout title="Sign in to your account">
      <Form
        action={ApiRoutes.PASSWORD_LOGIN}
        method="POST"
        onSubmitSuccess={(res) => {
          setToken({access: res.data.accessToken, refresh: res.data.refreshToken});
          setHeaders(res.data.accessToken);
          return navigate({to: '/friends'});
        }}
        className="space-y-6"
      >
        <FormRootErrors />

        <TextFormField
          name="username"
          required
        >
          <Label>Username</Label>
          <Input
            type="text"
            placeholder="Enter your username"
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
            placeholder="Enter your password"
          />
          <FieldError />
        </TextFormField>

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
