import { useEffect, useState } from 'react';

import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';

import { Paths } from '@/api-types/routePaths.ts';
import { axiosInstance } from '@/axios';
import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { AuthLayout } from './-layout';

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
  const { code } = Route.useSearch();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!code) return;

    axiosInstance
      .post(Paths.VERIFY_EMAIL, {
        token: code,
      })
      .then(() => navigate({ to: '/friends' }))
      .catch((e) => setError(e));
  }, [code, navigate]);

  if (!code) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <AuthLayout
      subtitle="Please wait we are verifying your email address"
      title="Verifying email"
    >
      <ErrorAlert error={error} />
    </AuthLayout>
  );
}
