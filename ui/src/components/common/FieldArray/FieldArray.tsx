import {ComponentProps, createContext, useMemo} from 'react';
import {UseFieldArrayProps, UseFieldArrayReturn, useFieldArray} from 'react-hook-form';

import {RenderProps, useRenderProps} from '@/components/common/render-props.ts';

interface Props
  extends RenderProps<UseFieldArrayReturn & {keyName: string}>,
    UseFieldArrayProps,
    Omit<ComponentProps<'div'>, keyof RenderProps<UseFieldArrayReturn>> {}

export const FieldArrayContext = createContext<UseFieldArrayReturn & {keyName: string} | null>(null);

export function FieldArray({keyName = 'id', name, control, rules, shouldUnregister, ...restProps}: Props) {
  // here we can properly type Keyname instead of a string but that won't make any difference
  // as the type will be lost in children
  const fieldArrayProps = useFieldArray({keyName, name, control, rules, shouldUnregister});

  const contextValue = useMemo(() => ({...fieldArrayProps, keyName}), [fieldArrayProps, keyName]);

  const renderProps = useRenderProps({
    ...restProps,
    values: contextValue,
  });

  return (
    <FieldArrayContext.Provider value={contextValue}>
      <div {...renderProps} />
    </FieldArrayContext.Provider>
  );
}
