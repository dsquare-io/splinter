import { accessTokenStore, setAccessToken, setRefreshToken } from '@/authStorage.ts';
import { setHeaders } from '@/axios.ts';
import { currencyPreference } from '@/collections/currencyPreference.ts';
import { profile } from '@/collections/profile.ts';
import { syncEntity, useEntitySync } from '@/hooks/useEntitySync.ts';
import { useLocalValue } from '@/hooks/useLocalValue.ts';
import { rxdbPromise } from '@/rxdb.ts';

export enum AuthStatus {
  LOGGED_OUT = 'logged_out',
  VALIDATING = 'validating',
  LOGGED_IN = 'logged_in',
  ERROR = 'error',
}

export function useAuth() {
  const accessToken = useLocalValue(accessTokenStore) ?? null;

  // currentUser comes straight from localStorage — available instantly, including offline,
  // unlike the old fetchStatus:'paused' special case this replaces.
  const currentUser = useLocalValue(profile.store) ?? null;
  const { error: authError } = useEntitySync(profile, { enabled: !!accessToken });

  let status: AuthStatus;
  if (!accessToken) {
    status = AuthStatus.LOGGED_OUT;
  } else if (currentUser) {
    status = AuthStatus.LOGGED_IN;
  } else if (authError) {
    status = AuthStatus.ERROR;
  } else {
    status = AuthStatus.VALIDATING;
  }

  return {
    status,
    authError: authError ?? null,
    currentUser,
    setToken: ({ access, refresh } = { access: '', refresh: '' }) => {
      setAccessToken(access || null);
      setRefreshToken(refresh || null);
    },
    logout: ({ redirect = false }: { redirect?: boolean } = {}) => {
      setAccessToken(null);
      setRefreshToken(null);
      setHeaders(null);
      // localStorage has no scoped "wipe everything" like RxDB's db.remove() below — each
      // LocalValue-backed store must be cleared explicitly.
      profile.store.clear();
      currencyPreference.store.clear();
      rxdbPromise.then((db) => db.remove());
      if (redirect) window.location.href = '/auth/login';
    },
    refetchProfile: () => syncEntity(profile),
  };
}
