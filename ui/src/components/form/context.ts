import { createContext } from 'react';
import type { FieldError, FieldValues, UseFieldArrayReturn } from 'react-hook-form';

import type { ContextValue } from '@/hooks/useContextProps';
import type { FormProps } from './types';

export const FormContext =
  createContext<ContextValue<FormProps<any, FieldValues, any>, HTMLFormElement>>(null);

export const FieldErrorContext = createContext<FieldError | null>(null);

export const FieldArrayContext = createContext<(UseFieldArrayReturn & { keyName: string }) | null>(null);
