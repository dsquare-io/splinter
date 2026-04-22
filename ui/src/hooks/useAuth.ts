import { useEffect, useState } from 'react';

import { ApiRoutes } from '@/api-types';
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
  const [accessToken, setAccessTokenState] = useState<string | null>(getAccessToken);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(getRefreshToken);
  const [validationResponse, setValidation] = useState<boolean | undefined>();

  useEffect(() => {
    const sync = () => {
      setAccessTokenState(getAccessToken());
      setRefreshTokenState(getRefreshToken());
    };
    addAuthTokenChangeListener(sync);
    return () => removeAuthTokenChangeListener(sync);
  }, []);

  let status: AuthStatus = AuthStatus.LOGGED_OUT;
  if (validationResponse === undefined && accessToken) {
    status = AuthStatus.VALIDATING;
  } else if (validationResponse) {
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
        .then(() => setValidation(true))
        .catch((e) => {
          // only logout request failed with unauthorized error code
          if (e.response?.status !== 401) return;
          setAccessToken(null);
          setRefreshToken(null);
          setHeaders();
          setValidation(false);
        });
    } else {
      // user is logged out intentionally
      setValidation(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, refreshToken]);

  return {
    status,
    token: { accessToken, refreshToken },
    setToken: ({ access, refresh } = { access: '', refresh: '' }) => {
      setAccessToken(access || null);
      setRefreshToken(refresh || null);
    },
  };
}
