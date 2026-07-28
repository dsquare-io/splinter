import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

export function useIsOnline(): boolean {
  return useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline()
  );
}
