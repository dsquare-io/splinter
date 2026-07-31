import { onlineManager } from '@tanstack/react-query';
import axios, { isAxiosError, isCancel } from 'axios';

import { ApiRoutes, type AccessToken } from '@/api-types';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '@/authStorage.ts';

const cachedAccessToken = getAccessToken();
export const axiosInstance = axios.create({
  withCredentials: true,
  headers: cachedAccessToken
    ? {
        Authorization: `Bearer ${cachedAccessToken}`,
      }
    : {},
});

let _refreshTokenRequest: Promise<AccessToken> | null = null;

function refreshTokens(): Promise<AccessToken> {
  if (!_refreshTokenRequest) {
    const redirectToLogin = () => {
      setAccessToken(null);
      setRefreshToken(null);
      setHeaders(null);

      window.location.href = '/auth/login';
    };

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      redirectToLogin();
      return Promise.reject(new Error('No refresh token'));
    }

    _refreshTokenRequest = axios
      .post<AccessToken>(ApiRoutes.REFRESH_ACCESS_TOKEN, { refreshToken })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setHeaders(res.data.accessToken);
        return res.data;
      })
      .catch((e) => {
        if (e.response?.status === 400) redirectToLogin();
        throw e;
      })
      .finally(() => {
        _refreshTokenRequest = null;
      });
  }

  return _refreshTokenRequest;
}

axiosInstance.interceptors.response.use(
  (res) => {
    onlineManager.setOnline(true);
    return res;
  },
  (e) => {
    if (!isCancel(e)) onlineManager.setOnline(!(isAxiosError(e) && !e.response));
    throw e;
  }
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (e) => {
    const originalRequest = e.config;
    if (
      e.response?.status !== 401 ||
      originalRequest.url === ApiRoutes.REFRESH_ACCESS_TOKEN ||
      originalRequest._retry
    ) {
      throw e;
    }

    if (e.response?.data?.code?.startsWith('authn:')) {
      const { accessToken } = await refreshTokens();

      originalRequest._retry = true;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return axiosInstance.request(originalRequest);
    }

    throw e;
  }
);

export function setHeaders(accessToken?: string | null) {
  if (accessToken) {
    axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    axiosInstance.defaults.headers.Authorization = null;
  }
}
