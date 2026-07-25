import { addRxPlugin, createRxDatabase } from 'rxdb/plugins/core';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';

if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}

export const rxdbPromise = createRxDatabase({
  name: 'splinter',
  storage: getRxStorageDexie(),
});
