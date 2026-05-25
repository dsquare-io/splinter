import axios from 'axios';

import { ApiRoutes } from '@/api-types';
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

type Tokens = { accessToken: string; refreshToken: string };

let _refreshTokenRequest: Promise<Tokens> | null = null;

function refreshTokens(): Promise<Tokens> {
  if (!_refreshTokenRequest) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return Promise.reject(new Error('No refresh token'));

    _refreshTokenRequest = axios
      .post<Tokens>(ApiRoutes.REFRESH_ACCESS_TOKEN, { refreshToken })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setHeaders(res.data.accessToken);
        return res.data;
      })
      .catch((e) => {
        setAccessToken(null);
        setRefreshToken(null);
        setHeaders(null);

        window.location.href = '/auth/login';
        throw e;
      })
      .finally(() => {
        _refreshTokenRequest = null;
      });
  }

  return _refreshTokenRequest;
}

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

    if (e.response?.data?.code === 'authn:token_expired' && getRefreshToken()) {
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
