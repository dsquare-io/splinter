import {createFileRoute, Navigate, useNavigate} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import {setHeaders} from '@/axios';
import {Button, FieldError, Form, FormRootErrors, Input, Label, TextFormField} from '@/components/common';
import useAuth from '@/hooks/useAuth';

import AuthLayout from './-layout';


export const Route = createFileRoute('/auth/accept')({
  component: RootComponent,
  validateSearch: (search) => {
    return {
      uid: search.uid,
      token: search.token,
    } as const;
  },
});

function RootComponent() {
  const navigate = useNavigate();
  const {uid, token} = Route.useSearch();
  const {setToken} = useAuth();

  if (!uid || !token) {
    return <Navigate to="/auth/login" />
  }

  return (
    <AuthLayout
      subtitle="Please create your password to get started"
      title="Welcome to Splinter"
    >
      <Form
        action={ApiRoutes.RESET_PASSWORD}
        method="POST"
        onSubmitSuccess={(res) => {
          setToken({
            access: res.data.accessToken,
            refresh: res.data.refreshToken,
          });
          setHeaders(res.data.accessToken);
          return navigate({to: '/friends'});
        }}
        transformData={(data, form) => {
          if (data['password'] !== data['password2']) {
            form.setError('password2', {
              message: 'Password Mismatch',
            });
            return undefined;
          }
          return {
            uid,
            token,
            password: data['password'],
          };
        }}
        className="space-y-6"
      >
        <FormRootErrors />

        <TextFormField
          name="password"
          required
        >
          <Label>Password</Label>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Enter your new password"
          />
          <FieldError />
        </TextFormField>

        <TextFormField
          name="password2"
          required
        >
          <Label>Confirm Password</Label>
          <Input
            type="password"
            autoComplete="new-password"
            placeholder="Please confirm your password"
          />
          <FieldError />
        </TextFormField>

        <Button
          className="w-full"
          slot="submit"
          type="submit"
        >
          Set Password
        </Button>
      </Form>
    </AuthLayout>
  );
}
