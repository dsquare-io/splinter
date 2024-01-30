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
  const token = accessToken ?? localStorage.getItem('splinter:access_token');
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    axiosInstance.defaults.headers.common.Authorization = null;
  }
}
