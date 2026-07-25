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
import { apiQueryOptions } from '@/hooks/useApiQuery.ts';
import { currencyPreferenceQueryOptions } from '@/hooks/useCurrencyPreference.ts';
import { queryClient } from '@/queryClient.ts';
import { persister } from '@/queryPersister.ts';

export enum AuthStatus {
  LOGGED_OUT = 'logged_out',
  VALIDATING = 'validating',
  LOGGED_IN = 'logged_in',
  ERROR = 'error',
}

export function profileQueryOptions() {
  return apiQueryOptions(ApiRoutes.PROFILE, undefined, undefined, {
    meta: { persist: true },
    gcTime: Infinity, // paired with a finite persistOptions.maxAge — see queryPersister.ts
    staleTime: 5 * 60_000,
    // Never let a transient/background refetch failure regress an already-known-good profile back to blank.
    placeholderData: (prev) => prev,
  });
}

export function useAuth() {
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken);

  useEffect(() => {
    const sync = () => setAccessTokenState(getAccessToken());
    addAuthTokenChangeListener(sync);
    return () => removeAuthTokenChangeListener(sync);
  }, []);

  const { data: currentUser, error: authError } = useQuery({
    ...profileQueryOptions(),
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
      if (redirect) window.location.href = '/auth/login';
    },
    refetchProfile: () => queryClient.refetchQueries({ queryKey: profileQueryOptions().queryKey }),
  };
}
