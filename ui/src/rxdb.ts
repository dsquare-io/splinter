import { addRxPlugin, createRxDatabase } from 'rxdb/plugins/core';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

// Dev-mode requires a schema-validating storage wrapper — otherwise it throws (DVM1)
// instead of catching real schema mismatches, which is the whole point of dev-mode.
const storage = import.meta.env.DEV
  ? wrappedValidateAjvStorage({ storage: getRxStorageDexie() })
  : getRxStorageDexie();

if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}

export const rxdbPromise = createRxDatabase({
  name: 'splinter',
  storage,
});
