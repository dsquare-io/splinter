export interface SyncableEntity {
  readonly name: string;
  /**
   * Ongoing "keep fresh" sync (mount, pull-to-refresh, post-mutation). Today: full pull +
   * full reconciliation via LocalCollection#replaceAll. Future seam: swap an entity's own
   * `sync` for one that applies deltas from a change-tracking endpoint — the base layer,
   * the hook layer, and every call site stay untouched.
   */
  sync(): Promise<void>;
  /**
   * Always a full pull + full reconciliation, regardless of what `sync` currently does.
   * Today: identical to `sync`. Escape hatch for future drift recovery / "resync everything".
   */
  rebuild(): Promise<void>;
}
