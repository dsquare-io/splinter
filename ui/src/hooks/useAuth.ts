import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { ApiRoutes } from '@/api-types';
import {
  addAuthTokenChangeListener,
  getAccessToken,
  removeAuthTokenChangeListener,
  setAccessToken,
  setRefreshToken,
} from '@/authStorage.ts';
import { setHeaders } from '@/axios.ts';
import { apiQueryKey, persistApiQueryOptions } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';
import { persister } from '@/queryPersister.ts';

export enum AuthStatus {
  LOGGED_OUT = 'logged_out',
  VALIDATING = 'validating',
  LOGGED_IN = 'logged_in',
  ERROR = 'error',
}

export function useAuth() {
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken);

  useEffect(() => {
    const sync = () => setAccessTokenState(getAccessToken());
    addAuthTokenChangeListener(sync);
    return () => removeAuthTokenChangeListener(sync);
  }, []);

  const { data: currentUser, error: authError } = useQuery({
    ...persistApiQueryOptions(ApiRoutes.PROFILE),
    enabled: !!accessToken,
  });

  let status: AuthStatus;
  if (!accessToken) {
    status = AuthStatus.LOGGED_OUT;
  } else if (currentUser) {
    // Includes the offline-with-cached-data case: fetchStatus may be 'paused', but data is present.
    status = AuthStatus.LOGGED_IN;
  } else if (authError) {
    status = AuthStatus.ERROR;
  } else {
    status = AuthStatus.VALIDATING;
  }

  return {
    status,
    authError: authError ?? null,
    currentUser: currentUser ?? null,
    setToken: ({ access, refresh } = { access: '', refresh: '' }) => {
      setAccessToken(access || null);
      setRefreshToken(refresh || null);
    },
    logout: ({ redirect = false }: { redirect?: boolean } = {}) => {
      setAccessToken(null);
      setRefreshToken(null);
      setHeaders(null);
      queryClient.removeQueries({ queryKey: apiQueryKey(ApiRoutes.PROFILE) });
      queryClient.removeQueries({ queryKey: apiQueryKey(ApiRoutes.CURRENCY_PREFERENCE) });
      persister.removeClient();

      // Dynamic import: keeps RxDB/TanStack DB out of the eager root bundle — useAuth.ts
      // is used by __root.tsx, so a static import here would ship it on every page load.
      import('@/rxdb.ts').then(({ rxdbPromise }) => rxdbPromise.then((db) => db.remove()));
      if (redirect) window.location.href = '/auth/login';
    },
    refetchProfile: () => queryClient.refetchQueries({ queryKey: apiQueryKey(ApiRoutes.PROFILE) }),
  };
}
