import { startTransition, useEffect, useState } from 'react';

import { ApiRoutes, User } from '@/api-types';
import {
  addAuthTokenChangeListener,
  getAccessToken,
  getRefreshToken,
  removeAuthTokenChangeListener,
  setAccessToken,
  setRefreshToken,
} from '@/authStorage.ts';
import { axiosInstance } from '@/axios.ts';

export enum AuthStatus {
  LOGGED_OUT = 'logged_out',
  VALIDATING = 'validating',
  LOGGED_IN = 'logged_in',
}

let cachedUser: User | null = null;
let profileRequest: Promise<User> | null = null;
const profileListeners = new Set<(user: User | null) => void>();

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
        profileListeners.forEach((fn) => fn(res.data));
        return res.data;
      })
      .finally(() => {
        profileRequest = null;
      });
  }
  return profileRequest;
}

export default function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(cachedUser);
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(getRefreshToken);

  useEffect(() => {
    const sync = () => {
      setAccessTokenState(getAccessToken());
      setRefreshTokenState(getRefreshToken());
    };
    addAuthTokenChangeListener(sync);
    return () => removeAuthTokenChangeListener(sync);
  }, []);

  useEffect(() => {
    profileListeners.add(setCurrentUser);
    return () => {
      profileListeners.delete(setCurrentUser);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      cachedUser = null;
      startTransition(() => setCurrentUser(null));
      return;
    }

    if (cachedUser) {
      startTransition(() => setCurrentUser(cachedUser));
      return;
    }

    fetchProfile()
      .then(setCurrentUser)
      .catch(() => {
        cachedUser = null;
        setCurrentUser(null);
      });
  }, [accessToken]); // refreshToken excluded — rotation doesn't change identity

  let status: AuthStatus = AuthStatus.LOGGED_OUT;
  if (!currentUser && accessToken) {
    status = AuthStatus.VALIDATING;
  } else if (currentUser) {
    status = AuthStatus.LOGGED_IN;
  }

  return {
    status,
    currentUser,
    token: { accessToken, refreshToken },
    setToken: ({ access, refresh } = { access: '', refresh: '' }) => {
      setAccessToken(access || null);
      setRefreshToken(refresh || null);
    },
    refetchProfile: () =>
      fetchProfile(true).catch(() => {
        cachedUser = null;
        profileListeners.forEach((fn) => fn(null));
      }),
  };
}
