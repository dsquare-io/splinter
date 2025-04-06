import {useEffect, useState} from 'react';

import {useLocalStorage} from '@mantine/hooks';

import {ApiRoutes} from '@/api-types';
import {axiosInstance, setHeaders} from '@/axios.ts';


export enum AuthStatus {
  LOGGED_OUT = 'logged_out',
  VALIDATING = 'validating',
  LOGGED_IN = 'logged_in',
}

let profileRequest: Promise<any> | undefined;

export default function useAuth() {
  const [accessToken, setToken, removeToken] = useLocalStorage({
    key: 'splinter:access_token',
    serialize: (v) => v,
    deserialize: (v) => v!,
    getInitialValueInEffect: false,
  });
  const [refreshToken, setRefreshToken, removeRefreshToken] = useLocalStorage({
    key: 'splinter:refresh_token',
    serialize: (v) => v,
    deserialize: (v) => v!,
    getInitialValueInEffect: false,
  });
  const [validationResponse, setValidation] = useState<boolean | undefined>();

  let status: AuthStatus = AuthStatus.LOGGED_OUT;
  if (validationResponse === undefined && accessToken) {
    status = AuthStatus.VALIDATING;
  } else if (validationResponse) {
    status = AuthStatus.LOGGED_IN;
  }

  useEffect(() => {
    if (!profileRequest && accessToken) {
      profileRequest = axiosInstance.get(ApiRoutes.PROFILE).finally(() => {
        profileRequest = undefined;
      });
    }

    if (accessToken) {
      profileRequest
        ?.then(() => setValidation(true))
        .catch(() => {
          removeToken();
          removeRefreshToken();
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
    token: {accessToken, refreshToken},
    setToken: ({access, refresh} = {access: '', refresh: ''}) => {
      console.log({access, refresh});
      if (access) {
        setToken(access);
      } else {
        removeToken();
      }

      if (refresh) {
        setRefreshToken(refresh);
      } else {
        removeRefreshToken();
      }
    },
  };
}
