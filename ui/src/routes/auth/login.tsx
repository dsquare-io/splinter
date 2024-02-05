import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextFormField,
} from '@components/common';
import {createFileRoute, useNavigate} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import {setHeaders} from '@/axios';
import useAuth from '@/hooks/useAuth';

import AuthLayout from './-layout';

export const Route = createFileRoute('/auth/login')({
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();
  const {setToken} = useAuth();

  return (
    <AuthLayout>
      <Form
        action={ApiRoutes.AUTHENTICATE_USER}
        method="POST"
        onSubmitSuccess={(res) => {
          setToken({access: res.data.accessToken, refresh: ''});
          setHeaders(res.data.accessToken);
          return navigate({to: '/friends'});
        }}
        className="space-y-6"
      >
        <TextFormField
          name="email"
          required
        >
          <Label>Email</Label>
          <Input type="email" placeholder="Enter your email" />
          <FieldError />
        </TextFormField>

        <TextFormField
          name="password"
          required
        >
          <Label>Password</Label>
          <Input type="password" placeholder="Enter your password" />
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