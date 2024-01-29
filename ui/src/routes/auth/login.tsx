import { Form, Button, Label, Input, FieldError, inputStyles } from '@components/common';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ApiRoutes } from '../../api-types';
import AuthLayout from './-layout.tsx';
import { Field } from '@components/common/Form/Field.tsx';
import { TextField } from 'react-aria-components';
import { setHeaders } from '../../axios.ts';

export const Route = createFileRoute('/auth/login')({
  component: RootComponent,
});

function RootComponent() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <Form
        action={ApiRoutes.AUTHENTICATE_USER}
        method="POST"
        onSubmitSuccess={(res) => {
          setHeaders(res.data.accessToken);
          return navigate({to: '/friends'});
        }}
        className="space-y-6"
      >

        <Field name="email" required defaultValue="">
          <TextField className="flex flex-col my-1">
            <Label>Email</Label>
            <Input type="email" className={inputStyles} />
            <FieldError />
          </TextField>
        </Field>

        <Field name="password" required defaultValue="">
          <TextField className="flex flex-col my-1">
            <Label>Password</Label>
            <Input type="password" className={inputStyles} />
            <FieldError />
          </TextField>
        </Field>

        <Button className="w-full" slot="submit" type="submit">Submit</Button>
      </Form>
    </AuthLayout>
  );
}