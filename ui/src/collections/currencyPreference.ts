import { ApiRoutes } from '@/api-types';
import { fetchApi } from '@/hooks/useApiQuery.ts';
import { LocalValue } from '@/localValue.ts';
import type { SyncableEntity } from './base/types.ts';

const store = new LocalValue<string>('splinter-currency-preference');

const sync = () => fetchApi(ApiRoutes.CURRENCY_PREFERENCE).then(({ uid }) => store.set(uid));

export const currencyPreference: SyncableEntity & { store: LocalValue<string> } = {
  name: 'currency-preference',
  store,
  sync,
  rebuild: sync,
  hasCache: () => Promise.resolve(store.get() !== undefined),
};
