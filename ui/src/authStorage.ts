import { LocalValue } from '@/localValue.ts';

export const accessTokenStore = new LocalValue<string>('splinter-access-token');
export const refreshTokenStore = new LocalValue<string>('splinter-refresh-token');

export function getAccessToken(): string | null {
  return accessTokenStore.get() ?? null;
}

export function getRefreshToken(): string | null {
  return refreshTokenStore.get() ?? null;
}

export function setAccessToken(value: string | null): void {
  if (value) accessTokenStore.set(value);
  else accessTokenStore.clear();
}

export function setRefreshToken(value: string | null): void {
  if (value) refreshTokenStore.set(value);
  else refreshTokenStore.clear();
}
