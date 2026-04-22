const ACCESS_TOKEN_KEY = 'splinter:access_token';
const REFRESH_TOKEN_KEY = 'splinter:refresh_token';

const AUTH_STORAGE_EVENT = 'splinter:auth-storage-updated';

function notify() {
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

export function addAuthTokenChangeListener(callback: () => void): void {
  window.addEventListener(AUTH_STORAGE_EVENT, callback);
}

export function removeAuthTokenChangeListener(callback: () => void): void {
  window.removeEventListener(AUTH_STORAGE_EVENT, callback);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAccessToken(value: string | null): void {
  value ? localStorage.setItem(ACCESS_TOKEN_KEY, value) : localStorage.removeItem(ACCESS_TOKEN_KEY);
  notify();
}

export function setRefreshToken(value: string | null): void {
  value ? localStorage.setItem(REFRESH_TOKEN_KEY, value) : localStorage.removeItem(REFRESH_TOKEN_KEY);
  notify();
}
