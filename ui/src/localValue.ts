type Listener = () => void;

const UNSET = Symbol('unset');

/**
 * A single JSON-serializable value persisted to localStorage, with change notification.
 * No diffing/reconciliation to do — a single key is either overwritten or cleared.
 */
export class LocalValue<T> {
  private readonly listeners = new Set<Listener>();
  // Sentinel distinguishes "never read" from a real localStorage null, so the first get()
  // always parses. Caching the parsed result keeps get() returning a stable object
  // reference across calls when the raw string hasn't changed — required by
  // useSyncExternalStore (useLocalValue), which otherwise sees a "new" snapshot on every
  // render (JSON.parse allocates a fresh object each time) and loops forever.
  private cachedRaw: string | null | typeof UNSET = UNSET;
  private cachedValue: T | undefined;

  constructor(private readonly key: string) {
    // The native `storage` event only fires in *other* tabs, not the one that wrote —
    // same-tab reactivity is handled by the explicit notify() calls in set()/clear().
    window.addEventListener('storage', (event) => {
      if (event.key === this.key) this.notify();
    });
  }

  get(): T | undefined {
    const raw = localStorage.getItem(this.key);
    if (raw === this.cachedRaw) return this.cachedValue;

    this.cachedRaw = raw;
    if (raw === null) {
      this.cachedValue = undefined;
    } else {
      try {
        this.cachedValue = JSON.parse(raw) as T;
      } catch {
        this.cachedValue = undefined;
      }
    }
    return this.cachedValue;
  }

  set(value: T): void {
    localStorage.setItem(this.key, JSON.stringify(value));
    this.notify();
  }

  clear(): void {
    localStorage.removeItem(this.key);
    this.notify();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }
}
