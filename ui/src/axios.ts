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

let refreshTokenRequest: Promise<any> | undefined;

axiosInstance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const refreshToken = getRefreshToken();
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

      setAccessToken(tokenRes.data.accessToken);
      setRefreshToken(tokenRes.data.refreshToken);
      setHeaders(tokenRes.data.accessToken);

      err.config.headers.Authorization = `Bearer ${tokenRes.data.accessToken}`;
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
