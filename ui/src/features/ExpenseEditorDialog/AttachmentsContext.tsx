import { createContext, useContext } from 'react';

import type { UseAttachmentsReturn } from './useAttachments.ts';

export const AttachmentsContext = createContext<UseAttachmentsReturn | null>(null);

export function useAttachmentsContext(): UseAttachmentsReturn {
  const ctx = useContext(AttachmentsContext);
  if (!ctx) throw new Error('useAttachmentsContext must be used within AttachmentsContext.Provider');
  return ctx;
}
