import {Navigate, createFileRoute} from '@tanstack/react-router';

import useAuth, {AuthStatus} from '@/hooks/useAuth.ts';

export const Route = createFileRoute('/')({
  component: IndexComponents,
});

function IndexComponents() {
  const {status} = useAuth();

  if (status === AuthStatus.VALIDATING) return;
  if (status === AuthStatus.LOGGED_OUT) return <Navigate to="/auth/login" />;
  return <Navigate to="/groups" />;
}
