import { useContext } from 'react';

import { DialogContext } from './context';

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within a Dialog');
  return ctx;
}
