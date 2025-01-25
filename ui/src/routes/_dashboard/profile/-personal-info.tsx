import {TextField} from 'react-aria-components';

import {Paths} from '@/api-types/routePaths.ts';
import {Button, FieldError, Form, FormRootErrors, Input, Label, TextFormField} from '@/components/common';
import {apiQueryOptions, useApiQuery} from '@/hooks/useApiQuery.ts';
import {queryClient} from '@/queryClient.ts';

export default function PersonalInfo() {
  const {data: profile} = useApiQuery(Paths.PROFILE);

  if (!profile) return;

  return (
    <Form
      values={profile}
      action={Paths.PROFILE}
      onSubmitSuccess={() => queryClient.invalidateQueries(apiQueryOptions(Paths.PROFILE))}
      method="PUT"
      className="@container md:col-span-2"
    >
      <FormRootErrors />

      <div className="space-y-6">
        <div className="@lg:space-y-0 @lg:flex @lg:space-x-3 items-center space-y-6 *:w-full">
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
            {profile.isVerified && <div className="text-sm text-red-600">Not verified</div>}
          </div>
          <Input
            type="email"
            value={profile.email!}
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
