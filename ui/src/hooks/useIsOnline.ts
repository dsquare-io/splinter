import { useSyncExternalStore } from 'react';

import { onlineManager } from '@tanstack/react-query';

export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline()
  );
}
