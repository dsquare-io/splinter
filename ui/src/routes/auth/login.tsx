import { Form, Button, TextField } from '@components/common';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/login')({
  component: RootComponent,
})

 function RootComponent() {
  return (
    <Form>
      <TextField name="email" type="email" isRequired label="Email" />
      <TextField name="password" type="password" isRequired label="Password" />

      <Button slot="submit" type="submit">Test</Button>
    </Form>
  );
}