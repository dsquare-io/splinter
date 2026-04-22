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
  async (err) => {
    const originalRequest = err.config;

    if (
      err.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === ApiRoutes.REFRESH_ACCESS_TOKEN ||
      !getRefreshToken()
    ) {
      throw err;
    }

    originalRequest._retry = true;

    const { accessToken } = await refreshTokens();
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return axiosInstance.request(originalRequest);
  }
);

export function setHeaders(accessToken?: string | null) {
  if (accessToken) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    axiosInstance.defaults.headers.common.Authorization = null;
  }
}
