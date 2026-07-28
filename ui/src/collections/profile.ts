import { ApiRoutes, type ApiResponse } from '@/api-types';
import { fetchApi } from '@/hooks/useApiQuery.ts';
import { LocalValue } from '@/localValue.ts';
import type { SyncableEntity } from './base/types.ts';

type Profile = ApiResponse<typeof ApiRoutes.PROFILE>;

const store = new LocalValue<Profile>('splinter-profile');

const sync = () => fetchApi(ApiRoutes.PROFILE).then((row) => store.set(row));

export const profile: SyncableEntity & { store: LocalValue<Profile> } = {
  name: 'profile',
  store,
  sync,
  rebuild: sync,
};
