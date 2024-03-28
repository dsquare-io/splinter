import {PropsWithChildren, createContext, useContext} from 'react';

const FieldScopeContext = createContext<string>('');

export function useScopedFieldName<T extends string | undefined>(name?: T): T {
  const baseName = useContext(FieldScopeContext) ?? '';

  return (name ? [baseName, name].filter(Boolean).join('.') : name) as T;
}

export function FieldScope({name = '', children}: PropsWithChildren<{name?: string}>) {
  const scopedName = useScopedFieldName(name);
  return <FieldScopeContext.Provider value={scopedName}>{children}</FieldScopeContext.Provider>;
}
