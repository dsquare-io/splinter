import { useEffect, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import type { SyncableEntity } from '@/collections/base/types.ts';
import { queryClient } from '@/queryClient.ts';

function syncQueryKey(entity: Pick<SyncableEntity, 'name'>) {
  return ['collection-sync', entity.name] as const;
}

// TanStack Query rejects a queryFn that resolves `undefined` — SyncableEntity.sync/rebuild
// return Promise<void>, so wrap with a stable non-undefined result before handing it off.
function toQueryFn(run: () => Promise<void>) {
  return () => run().then(() => true as const);
}

/** View-layer hook: drives entity.sync() and exposes loading/error/refetch for it.
 *  Rendered data is NOT returned here — read it via useLiveQuery against entity.collection;
 *  this hook only owns "is the refresh in flight / did it ever succeed / did it error".
 *
 *  The cache lives indefinitely — mounting/remounting a screen never triggers a network
 *  resync on its own. Auto-sync only fires once, the first time an entity's local cache is
 *  still empty; afterwards the only ways to sync again are an explicit `refetch()` (pull to
 *  refresh) or a mutation-driven `syncEntity()` call. */
export function useEntitySync(entity: SyncableEntity, options?: { enabled?: boolean }) {
  const [hasCache, setHasCache] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void entity.hasCache().then((result) => {
      if (!cancelled) setHasCache(result);
    });
    return () => {
      cancelled = true;
    };
  }, [entity]);

  const query = useQuery({
    queryKey: syncQueryKey(entity),
    queryFn: toQueryFn(entity.sync),
    networkMode: 'offlineFirst',
    staleTime: Infinity, // RxDB/localStorage is the source of truth, not this query's data
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    enabled: (options?.enabled ?? true) && hasCache === false,
  });
  return {
    isSyncing: query.isFetching,
    hasSynced: hasCache === true || query.isSuccess,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Imperative "sync now" for call sites outside render (post-mutation refresh). Shares the
 *  same query key as useEntitySync, so a hook-driven sync and an imperative one dedupe onto
 *  one in-flight network call instead of racing two. */
export function syncEntity(entity: SyncableEntity): Promise<void> {
  return queryClient
    .fetchQuery({ queryKey: syncQueryKey(entity), queryFn: toQueryFn(entity.sync), staleTime: 0 })
    .then(() => undefined);
}

/** Escape hatch: force a full rebuild regardless of what sync() currently does. Not called
 *  anywhere yet — wired for future drift-recovery / "resync everything" affordance. */
export function rebuildEntity(entity: SyncableEntity): Promise<void> {
  return queryClient
    .fetchQuery({ queryKey: syncQueryKey(entity), queryFn: toQueryFn(entity.rebuild), staleTime: 0 })
    .then(() => undefined);
}
