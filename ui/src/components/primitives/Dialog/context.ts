import { createContext } from 'react';

type DialogContextValue = {
  close: () => void;
};

export const DialogContext = createContext<DialogContextValue | null>(null);
