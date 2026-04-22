import { useEffect, useState } from 'react';

import { ApiRoutes, User } from '@/api-types';
import {
  addAuthTokenChangeListener,
  getAccessToken,
  getRefreshToken,
  removeAuthTokenChangeListener,
  setAccessToken,
  setRefreshToken,
} from '@/authStorage.ts';
import { axiosInstance, setHeaders } from '@/axios.ts';

export enum AuthStatus {
  LOGGED_OUT = 'logged_out',
  VALIDATING = 'validating',
  LOGGED_IN = 'logged_in',
}

let profileRequest: Promise<any> | undefined;

export default function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  let status: AuthStatus = AuthStatus.LOGGED_OUT;
  if (!currentUser && accessToken) {
    status = AuthStatus.VALIDATING;
  } else if (currentUser) {
    status = AuthStatus.LOGGED_IN;
  }

  useEffect(() => {
    if (accessToken) {
      if (!profileRequest) {
        profileRequest = axiosInstance.get(ApiRoutes.PROFILE).finally(() => {
          profileRequest = undefined;
        });
      }

      profileRequest
        .then(({ data }) => {
          setCurrentUser(data);
        })
        .catch((e) => {
          // only logout request failed with unauthorized error code
          if (e.response?.status !== 401) return;
          setAccessToken(null);
          setRefreshToken(null);
          setHeaders();
          setCurrentUser(null);
        });
    } else {
      // user is logged out intentionally
      setCurrentUser(null);
    }
  }, [accessToken, refreshToken]);

  return {
    status,
    currentUser,
    token: { accessToken, refreshToken },
    setToken: ({ access, refresh } = { access: '', refresh: '' }) => {
      setAccessToken(access || null);
      setRefreshToken(refresh || null);
    },
  };
}
