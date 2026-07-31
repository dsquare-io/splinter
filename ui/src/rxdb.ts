import { addRxPlugin, createRxDatabase } from 'rxdb/plugins/core';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

const DB_NAME = 'splinter';

// Dev-mode requires a schema-validating storage wrapper — otherwise it throws (DVM1)
// instead of catching real schema mismatches, which is the whole point of dev-mode.
const storage = import.meta.env.DEV
  ? wrappedValidateAjvStorage({ storage: getRxStorageDexie() })
  : getRxStorageDexie();

if (import.meta.env.DEV) {
  addRxPlugin(RxDBDevModePlugin);
}

const WIPE_FLAG = 'splinter-wipe-local-db';

/** Ask for every local database to be deleted on the next boot — see `wipeIfRequested`. */
export function requestLocalDatabaseWipe(): void {
  localStorage.setItem(WIPE_FLAG, '1');
}

/**
 * RxDB's Dexie storage never removes the underlying IndexedDB databases: `remove()` only
 * clears each collection's `docs` table, and its `closeDexieDb` refcount starts at 0 and is
 * only ever decremented, so the connections are never closed either. Deleting the databases
 * while the app is running would therefore just block on RxDB's own open connections.
 *
 * So logout flags the wipe and reloads, and we delete here instead — at boot, before
 * `createRxDatabase` below opens anything, when no connection exists to block us.
 */
async function wipeIfRequested(): Promise<void> {
  // Never let this reject: rxdbPromise is chained off it, and every collection module awaits
  // that at the top level, so a throw here would take down all local storage rather than
  // just skipping the wipe. localStorage and indexedDB.databases() both throw outright under
  // Safari/iOS storage restrictions, which is exactly where that would bite.
  try {
    if (localStorage.getItem(WIPE_FLAG) === null) return;
    localStorage.removeItem(WIPE_FLAG);

    // Unsupported on Firefox, where the databases stay listed — emptied, but present.
    if (!indexedDB.databases) return;

    const prefix = `rxdb-dexie-${DB_NAME}--`;
    const names = (await indexedDB.databases())
      .map((db) => db.name)
      .filter((name) => !!name && name.startsWith(prefix));

    await Promise.all(
      names.map(
        (name) =>
          new Promise<void>((resolve) => {
            const request = indexedDB.deleteDatabase(name!);
            // `blocked` means another tab still holds this database open; the delete stays
            // queued for whenever that tab goes away, so resolve instead of hanging startup.
            request.onsuccess = request.onerror = request.onblocked = () => resolve();
          })
      )
    );
  } catch (error) {
    console.error('Failed to wipe local databases', error);
  }
}

export const rxdbPromise = wipeIfRequested().then(() => createRxDatabase({ name: DB_NAME, storage }));
