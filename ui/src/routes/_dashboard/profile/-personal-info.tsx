import { TextField } from 'react-aria-components';

import { ApiRoutes } from '@/api-types';
import { Button } from '@/components/common';
import { FieldError, Form, FormRootErrors, Input, Label, TextFormField } from '@/components/form';
import useAuth from '@/hooks/useAuth.ts';

export default function PersonalInfo() {
  const { currentUser, refetchProfile } = useAuth();
  if (!currentUser) return;

  return (
    <Form
      values={currentUser}
      action={ApiRoutes.PROFILE}
      onSubmitSuccess={() => refetchProfile()}
      method="PUT"
      className="@container md:col-span-2"
    >
      <FormRootErrors />

      <div className="space-y-6">
        <div className="items-center space-y-6 *:w-full @lg:flex @lg:space-y-0 @lg:space-x-3">
          <TextFormField
            name="firstName"
            required
          >
            <Label>First Name</Label>
            <Input
              type="text"
              placeholder="Your first name"
            />
            <FieldError />
          </TextFormField>

          <TextFormField
            name="lastName"
            required
          >
            <Label>Last Name</Label>
            <Input
              type="text"
              placeholder="Your last name"
            />
            <FieldError />
          </TextFormField>
        </div>

        <TextField isReadOnly>
          <div className="flex items-center justify-between">
            <Label>Email</Label>
            {currentUser.isVerified && <div className="text-sm text-red-600">Not verified</div>}
          </div>
          <Input
            type="email"
            value={currentUser.email!}
          />
          <FieldError />
        </TextField>
      </div>

      <Button
        className="mt-8"
        slot="submit"
        type="submit"
      >
        Update Profile
      </Button>
    </Form>
  );
}
