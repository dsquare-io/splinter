import {createFileRoute} from '@tanstack/react-router';

import {Paths} from '@/api-types/routePaths.ts';
import {Button, FieldError, Form, FormRootErrors, Input, Label, TextFormField} from '@/components/common';
import {apiQueryOptions, useApiQuery} from '@/hooks/useApiQuery.ts';
import {queryClient} from '@/queryClient.ts';

export const Route = createFileRoute('/_dashboard/profile/me')({
  component: RootComponent,
});

function RootComponent() {
  const {data: profile} = useApiQuery(Paths.PROFILE);

  return (
    <div className="mx-auto max-w-screen-lg divide-y divide-neutral-200">
      <section className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h1 className="text-lg font-medium leading-6 text-gray-900">Personal Info</h1>
          <p className="mt-1.5 text-sm text-gray-500">Manage your personal information.</p>
        </div>
        <Form
          values={profile}
          action={Paths.PROFILE}
          onSubmitSuccess={() => queryClient.invalidateQueries(apiQueryOptions(Paths.PROFILE))}
          method="PUT"
          className="md:col-span-2"
        >
          <FormRootErrors />

          <div className="space-y-6">
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

          <Button
            className="mt-8"
            slot="submit"
            type="submit"
          >
            Update Profile
          </Button>
        </Form>
      </section>

      <section className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <h1 className="text-lg font-medium leading-6 text-gray-900">Change Password</h1>
          <p className="mt-1.5 text-sm text-gray-500">Set a different password for your account.</p>
        </div>
        <Form
          action={Paths.CHANGE_PASSWORD}
          transformData={(
            {
              oldPassword,
              password,
              password2,
            }: {
              oldPassword: string;
              password: string;
              password2: string;
            },
            formRef
          ) => {
            if (password !== password2) {
              formRef.setError('password2', {
                message: 'Password Mismatch',
              });
              return undefined;
            }
            return {oldPassword, password};
          }}
          onSubmitSuccess={(_, formRef) => {
            formRef.reset();
          }}
          className="md:col-span-2"
        >
          <FormRootErrors />

          <div className="space-y-6">
            <TextFormField
              name="oldPassword"
              required
            >
              <Label>Old Password</Label>
              <Input
                type="password"
                placeholder="You old password"
                autoComplete="current-password"
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
                placeholder="Your new password"
                autoComplete="new-password"
              />
              <FieldError />
            </TextFormField>

            <TextFormField
              name="password2"
              required
            >
              <Label>Password again</Label>
              <Input
                type="password"
                placeholder="Your new password again"
                autoComplete="new-password"
              />
              <FieldError />
            </TextFormField>
          </div>

          <Button
            className="mt-8"
            slot="submit"
            type="submit"
          >
            Change Password
          </Button>
        </Form>
      </section>
    </div>
  );
}
