import { setHeaders } from '@/axios.ts';
import {TextField} from 'react-aria-components';

import {Button, FieldError, Form, Input, Label, inputStyles} from '@components/common';
import {Field} from '@components/common/Form/Field.tsx';
import {createFileRoute, useNavigate} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import useAuth from '@/hooks/useAuth.ts';

import AuthLayout from './-layout.tsx';

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
        <Field
          name="email"
          required
          defaultValue=""
        >
          <TextField className="my-1 flex flex-col">
            <Label>Email</Label>
            <Input
              type="email"
              className={inputStyles}
            />
            <FieldError />
          </TextField>
        </Field>

        <Field
          name="password"
          required
          defaultValue=""
        >
          <TextField className="my-1 flex flex-col">
            <Label>Password</Label>
            <Input
              type="password"
              className={inputStyles}
            />
            <FieldError />
          </TextField>
        </Field>

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
