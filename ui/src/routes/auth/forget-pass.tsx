import {createFileRoute, useNavigate} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import {setHeaders} from '@/axios';
import {Button, FieldError, Form, FormRootErrors, Input, Label, TextFormField} from '@/components/common';
import useAuth from '@/hooks/useAuth';

import AuthLayout from './-layout';

export const Route = createFileRoute('/auth/forget-pass')({
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const {setToken} = useAuth();

  return (
    <AuthLayout title="We’ll help you reset your password.">
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
      </Form>
    </AuthLayout>
  );
}
