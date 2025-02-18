import {useEffect, useState} from 'react';

import {Navigate, createFileRoute, useNavigate} from '@tanstack/react-router';

import {Paths} from '@/api-types/routePaths.ts';
import {axiosInstance} from '@/axios';
import {FormRootErrors} from '@/components/common';

import AuthLayout from './-layout';


export const Route = createFileRoute('/auth/verify')({
  component: RootComponent,
  validateSearch: (search) => {
    return {
      code: search.code,
    } as const;
  },
});

function RootComponent() {
  const navigate = useNavigate();
  const {code} = Route.useSearch();
  const [error, setError] = useState<string>("");

  if (!code) {
    return <Navigate to="/auth/login" />;
  }

  useEffect(() => {
    if (!code) return;

    axiosInstance
      .post(Paths.VERIFY_EMAIL, {
        token: code,
      })
      .then(() => navigate({to: '/friends'}))
      .catch(() => setError("Unable to verify email. Link is invalid or expired."));
  }, [code]);

  return (
    <AuthLayout
      subtitle="Please wait we are verifying your email address"
      title="Verifying email"
    >
      <FormRootErrors error={error} />
    </AuthLayout>
  );
}
