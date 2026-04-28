import { createFileRoute, Navigate } from '@tanstack/react-router';

import useAuth, { AuthStatus } from '@/hooks/useAuth.ts';

export const Route = createFileRoute('/')({
  component: IndexComponent,
});

function IndexComponent() {
  const { status } = useAuth();

  if (status === AuthStatus.VALIDATING) return;
  if (status === AuthStatus.LOGGED_OUT) return <Navigate to="/auth/login" />;
  return <Navigate to="/friends" />;
}
