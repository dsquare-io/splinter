import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { del, get, set } from 'idb-keyval';

import pkg from '../package.json';

export const PERSIST_BUSTER = pkg.version;

export const persister = createAsyncStoragePersister({
  key: 'splinter-query-cache',
  storage: {
    getItem: (key: string) => get(key),
    setItem: (key: string, value: string) => set(key, value),
    removeItem: (key: string) => del(key),
  },
});
