import { createContext, useContext } from 'react';

import type { UseAttachmentReturn } from './useAttachment.ts';

export const AttachmentContext = createContext<UseAttachmentReturn | null>(null);

export function useAttachmentContext(): UseAttachmentReturn {
  const ctx = useContext(AttachmentContext);
  if (!ctx) throw new Error('useAttachmentContext must be used within AttachmentContext.Provider');
  return ctx;
}
