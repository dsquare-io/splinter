import axios from 'axios';

export const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_APP_BACKEND_URL,
  headers: localStorage.getItem('splinter:access_token')
    ? {
        Authorization: `Bearer ${localStorage.getItem('splinter:access_token')}`,
      }
    : {},
});
