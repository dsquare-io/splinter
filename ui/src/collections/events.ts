type EventMap = {
  'expense:mutated': { uid: string; group?: string | null };
  'group:mutated': { uid: string };
  'friend:mutated': { uid: string };
};

type Listener<E extends keyof EventMap> = (payload: EventMap[E]) => Promise<void> | void;

const listeners: { [K in keyof EventMap]?: Set<Listener<K>> } = {};

export function on<E extends keyof EventMap>(event: E, listener: Listener<E>): void {
  const map = listeners as Record<E, Set<Listener<E>> | undefined>;
  const set = (map[event] ??= new Set());
  set.add(listener);
}

/**
 * Uses allSettled + console.error rather than Promise.all: one entity's failed resync
 * (e.g. offline) must not stop the caller's own success flow (closing a dialog, navigating
 * away) or block sibling entities from syncing.
 */
export async function emit<E extends keyof EventMap>(event: E, payload: EventMap[E]): Promise<void> {
  const results = await Promise.allSettled([...(listeners[event] ?? [])].map((listener) => listener(payload)));
  results
    .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
    .forEach((result) => console.error(event, result.reason));
}
