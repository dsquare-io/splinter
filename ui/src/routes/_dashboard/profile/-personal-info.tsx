import { ApiRoutes } from '@/api-types';
import { FieldError, Form, FormRootErrors } from '@/components/form';
import { TextFormInput } from '@/components/form-controls';
import { Button, Input, Label } from '@/components/primitives';
import { useAuth } from '@/hooks/useAuth.ts';

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

      <div className="space-y-4">
        <div className="items-center space-y-6 *:w-full @lg:flex @lg:space-y-0 @lg:space-x-3">
          <TextFormInput
            required
            name="firstName"
            type="text"
            placeholder="Your first name"
            label="First Name"
          />

          <TextFormInput
            required
            name="lastName"
            type="text"
            placeholder="Your last name"
            label="Last Name"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>Email</Label>
            {!currentUser.isVerified && <div className="text-sm text-red-600">Not verified</div>}
          </div>
          <Input
            type="email"
            value={currentUser.email!}
          />
          <FieldError />
        </div>
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
