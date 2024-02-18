import axios from 'axios';

import {Paths} from '@/api-types/routePaths.ts';

export const axiosInstance = axios.create({
  withCredentials: true,
  headers: localStorage.getItem('splinter:access_token')
    ? {
        Authorization: `Bearer ${localStorage.getItem('splinter:access_token')}`,
      }
    : {},
});

export function setLocalStorage(key: string, value: string) {
  localStorage.setItem(key, value);

  window.dispatchEvent(new Event('local-storage'));
  window.dispatchEvent(
    new CustomEvent('mantine-local-storage', {
      detail: {key, value},
    })
  );
}

let refreshTokenRequest: Promise<any> | undefined;

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const refreshToken = localStorage.getItem('splinter:refresh_token');
    if (err.response?.status === 401 && refreshToken) {
      let tokenRes;

      if (!refreshTokenRequest) {
        refreshTokenRequest = axios.post(Paths.REFRESH_ACCESS_TOKEN, {
          refreshToken,
        });
      }

      try {
        tokenRes = await refreshTokenRequest;
      } catch (_) {
        throw err;
      } finally {
        refreshTokenRequest = undefined;
      }

      setLocalStorage('splinter:access_token', tokenRes.data.accessToken);
      setLocalStorage('splinter:refresh_token', tokenRes.data.refreshToken);
      setHeaders(tokenRes.data.refreshToken);

      err.config.headers.Authorization = `Token ${tokenRes.data.accessToken}`;
      err.config.headers.Authorization = `Token ${tokenRes.data.accessToken}`;
      return axios.request(err.config);
    }
    throw err;
  }
);

export function setHeaders(accessToken?: string) {
  if (accessToken) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    axiosInstance.defaults.headers.common.Authorization = null;
  }
}
