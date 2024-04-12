import {PropsWithChildren, createContext, useContext} from 'react';

const FieldScopeContext = createContext<string>('');

/**
 * returns scoped name of a field given the name of field.
 */
export function useScopedFieldName(name?: string): string {
  const baseName = useContext(FieldScopeContext) ?? '';

  return [baseName, name].filter(Boolean).join('.');
}

/**
 * Creates a name scope for the descendant fields.
 *
 * For example,
 * ```jsx
 * <FieldScope name="foo">
 *   <Field name="bar" /> // this will be registered as `foo.bar`
 *   <FieldScope name="baz">
 *     <Field name="f1" /> // this will be registered as `foo.baz.f1`
 *   </FieldScope>
 * </FieldScope>
 * ```
 */
export function FieldScope({name = '', children}: PropsWithChildren<{name?: string}>) {
  const scopedName = useScopedFieldName(name);
  return <FieldScopeContext.Provider value={scopedName}>{children}</FieldScopeContext.Provider>;
}
