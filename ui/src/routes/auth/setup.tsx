import {createFileRoute, useNavigate} from '@tanstack/react-router';

import {ApiRoutes} from '@/api-types';
import {Button, FieldError, Form, FormRootErrors, Input, Label, TextFormField} from '@/components/common';

import AuthLayout from './-layout';
import {queryClient} from "@/queryClient.ts";
import {apiQueryOptions, useApiQuery} from "@/hooks/useApiQuery.ts";
import {Paths} from "@/api-types/routePaths.ts";


export const Route = createFileRoute('/auth/setup')({
  component: RootComponent,
});

function RootComponent() {
  const {data: profile} = useApiQuery(Paths.PROFILE);
  const navigate = useNavigate();

  if (!profile) return;

  return (
    <AuthLayout title="Setup your account">
      <Form
        action={ApiRoutes.PROFILE}
        values={profile}
        method="PUT"
        onSubmitSuccess={async () => {
          await queryClient.invalidateQueries(apiQueryOptions(Paths.PROFILE))
          return navigate({to: '/friends'});
        }}
        className="space-y-6"
      >
        <FormRootErrors />

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

        <Button
          className="w-full"
          slot="submit"
          type="submit"
        >
          Setup Profile
        </Button>
      </Form>
    </AuthLayout>
  );
}
