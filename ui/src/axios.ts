import axios from 'axios';

export const axiosInstance = axios.create({
  withCredentials: true,
  headers: localStorage.getItem('splinter:access_token')
    ? {
      Authorization: `Bearer ${localStorage.getItem('splinter:access_token')}`,
    }
    : {},
});

export function setHeaders(accessToken?: string) {
  if (accessToken) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    axiosInstance.defaults.headers.common.Authorization = null;
  }
}
