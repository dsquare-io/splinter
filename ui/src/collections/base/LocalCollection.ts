import { createCollection, type Collection } from '@tanstack/db';
import { rxdbCollectionOptions } from '@tanstack/rxdb-db-collection';
import type { RxCollection, RxJsonSchema } from 'rxdb/plugins/core';

import { rxdbPromise } from '@/rxdb.ts';

export class LocalCollection<TRow extends object> {
  private constructor(
    public readonly name: string,
    public readonly collection: Collection<TRow, string>,
    private readonly rxCollection: RxCollection<TRow>
  ) {}

  static async create<TRow extends object>(opts: {
    name: string;
    schema: RxJsonSchema<TRow>;
  }): Promise<LocalCollection<TRow>> {
    const db = await rxdbPromise;
    const created = await db.addCollections<Record<string, RxCollection<TRow>>>({
      [opts.name]: { schema: opts.schema as never },
    });
    const rxCollection = created[opts.name];
    const collection = createCollection(rxdbCollectionOptions<TRow>({ rxCollection }));
    return new LocalCollection(opts.name, collection, rxCollection);
  }

  /**
   * Full reconciliation: delete local rows whose primary key is absent from `rows`, then
   * upsert `rows`. The only mutation primitive this class exposes — "sync" and "rebuild"
   * both reduce to this today, and "rebuild" reduces to this forever.
   */
  async replaceAll(rows: TRow[]): Promise<void> {
    const existing = await this.rxCollection.find().exec();
    const primaryPath = this.rxCollection.schema.primaryPath;
    const incomingIds = new Set(rows.map((row) => (row as Record<string, unknown>)[primaryPath]));
    const staleIds = existing.map((doc) => doc.primary).filter((id) => !incomingIds.has(id));

    if (staleIds.length) await this.rxCollection.bulkRemove(staleIds);
    if (rows.length) await this.rxCollection.bulkUpsert(rows);
  }

  /** Upserts without deleting anything absent from `rows` — for partial pages, not full sets. */
  async upsertMany(rows: TRow[]): Promise<void> {
    if (rows.length) await this.rxCollection.bulkUpsert(rows);
  }

  async removeMany(ids: string[]): Promise<void> {
    if (ids.length) await this.rxCollection.bulkRemove(ids);
  }
}
