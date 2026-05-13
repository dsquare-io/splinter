import { startTransition, useEffect, useState } from 'react';

import { ApiRoutes, User } from '@/api-types';
import {
  addAuthTokenChangeListener,
  getAccessToken,
  removeAuthTokenChangeListener,
  setAccessToken,
  setRefreshToken,
} from '@/authStorage.ts';
import { axiosInstance, setHeaders } from '@/axios.ts';

export enum AuthStatus {
  LOGGED_OUT = 'logged_out',
  VALIDATING = 'validating',
  LOGGED_IN = 'logged_in',
  ERROR = 'error',
}

let cachedUser: User | null = null;
let cachedAuthError: unknown = null;
let profileRequest: Promise<User> | null = null;
const profileListeners = new Set<(user: User | null) => void>();
const authErrorListeners = new Set<(err: unknown) => void>();

function setAuthError(err: unknown) {
  cachedAuthError = err;
  authErrorListeners.forEach((fn) => fn(err));
}

function fetchProfile(invalidate = false): Promise<User> {
  if (invalidate) {
    cachedUser = null;
    profileRequest = null;
  }
  if (!profileRequest) {
    profileRequest = axiosInstance
      .get<User>(ApiRoutes.PROFILE)
      .then((res) => {
        cachedUser = res.data;
        setAuthError(null);
        profileListeners.forEach((fn) => fn(res.data));
        return res.data;
      })
      .catch((err) => {
        cachedUser = null;
        profileListeners.forEach((fn) => fn(null));
        setAuthError(err);
        throw err;
      })
      .finally(() => {
        profileRequest = null;
      });
  }
  return profileRequest;
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(cachedUser);
  const [authError, setAuthErrorState] = useState<unknown>(cachedAuthError);
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken);

  useEffect(() => {
    const sync = () => {
      setAccessTokenState(getAccessToken());
    };
    addAuthTokenChangeListener(sync);
    return () => removeAuthTokenChangeListener(sync);
  }, []);

  useEffect(() => {
    profileListeners.add(setCurrentUser);
    authErrorListeners.add(setAuthErrorState);
    return () => {
      profileListeners.delete(setCurrentUser);
      authErrorListeners.delete(setAuthErrorState);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      cachedUser = null;
      setAuthError(null);
      startTransition(() => setCurrentUser(null));
      return;
    }

    if (cachedUser) {
      startTransition(() => setCurrentUser(cachedUser));
      return;
    }

    fetchProfile()
      .then(setCurrentUser)
      .catch(() => {});
  }, [accessToken]); // refreshToken excluded — rotation doesn't change identity

  let status: AuthStatus = AuthStatus.LOGGED_OUT;
  if (currentUser) {
    status = AuthStatus.LOGGED_IN;
  } else if (accessToken && authError !== null) {
    status = AuthStatus.ERROR;
  } else if (accessToken) {
    status = AuthStatus.VALIDATING;
  }

  return {
    status,
    authError,
    currentUser,
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
    refetchProfile: () => {
      setAuthError(null);
      return fetchProfile(true)
        .then(setCurrentUser)
        .catch(() => {});
    },
  };
}
