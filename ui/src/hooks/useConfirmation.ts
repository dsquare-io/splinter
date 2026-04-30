import { createContext, ReactElement, useContext, type ReactNode } from 'react';

export interface ConfirmationOptions {
  callback?: () => Promise<any> | void;
  description?: ReactNode;
  actionLabel?: string;
  variant?: string;
  Icon?: ReactElement;
  title: string;
}

export const ConfirmationServiceContext = createContext<(options: ConfirmationOptions) => Promise<boolean>>(
  Promise.reject
);

export const useConfirmation = () => useContext(ConfirmationServiceContext);
