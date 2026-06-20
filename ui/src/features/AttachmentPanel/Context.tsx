import { createContext, useContext } from 'react';

import type { UseAttachmentReturn } from './useAttachment.ts';

const Context = createContext<UseAttachmentReturn | null>(null);

export function useAttachmentContext(): UseAttachmentReturn {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useAttachmentsContext must be used within AttachmentsContext.Provider');
  return ctx;
}
