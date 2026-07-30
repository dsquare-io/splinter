import { useSyncExternalStore } from 'react';

import type { LocalValue } from '@/localValue.ts';

export function useLocalValue<T>(store: LocalValue<T>): T | undefined {
  return useSyncExternalStore(
    (onChange) => store.subscribe(onChange),
    () => store.get()
  );
}
