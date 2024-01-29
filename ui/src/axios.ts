import axios from 'axios';

export const axiosInstance = axios.create({
  withCredentials: true,
  headers: localStorage.getItem('splinter:access_token')
    ? {
        Authorization: `Bearer ${localStorage.getItem('splinter:access_token')}`,
      }
    : {},
});

export function setHeaders(accessToken: string) {
  if (accessToken) {
    localStorage.setItem('splinter:access_token', accessToken);
    axiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`
  } else {
    localStorage.removeItem('splinter:access_token');
    delete axiosInstance.defaults.headers.Authorization;
  }
}
