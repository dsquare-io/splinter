import axios from 'axios';

import { Paths } from '@/api-types/routePaths.ts';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '@/authStorage.ts';

export const axiosInstance = axios.create({
  withCredentials: true,
  headers: getAccessToken()
    ? {
        Authorization: `Bearer ${getAccessToken()}`,
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
      .post<Tokens>(Paths.REFRESH_ACCESS_TOKEN, { refreshToken })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        setHeaders(res.data.accessToken);
        return res.data;
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
      originalRequest.url === Paths.REFRESH_ACCESS_TOKEN ||
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

export function setHeaders(accessToken?: string) {
  if (accessToken) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    axiosInstance.defaults.headers.common.Authorization = null;
  }
}
