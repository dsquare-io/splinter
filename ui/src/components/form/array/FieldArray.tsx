import { ComponentProps, useEffect, useMemo, useRef } from 'react';
import { useFieldArray, UseFieldArrayProps, UseFieldArrayReturn } from 'react-hook-form';

import { FieldArrayContext } from '../context';
import { RenderProps, useRenderProps } from './renderProps';

type FieldArrayProps = RenderProps<UseFieldArrayReturn & { keyName: string }> &
  UseFieldArrayProps &
  Omit<ComponentProps<'div'>, keyof RenderProps<UseFieldArrayReturn>> & {
    initialItemsCount?: number;
  };

export function FieldArray({
  keyName = 'id',
  name,
  control,
  rules,
  shouldUnregister,
  initialItemsCount,
  ...restProps
}: FieldArrayProps) {
  const isInitialRender = useRef(true);

  // here we can properly type Keyname instead of a string but that won't make any difference
  // as the type will be lost in children
  const fieldArrayProps = useFieldArray({ keyName, name, control, rules, shouldUnregister });

  const contextValue = useMemo(() => ({ ...fieldArrayProps, keyName }), [fieldArrayProps, keyName]);

  const renderProps = useRenderProps({
    ...restProps,
    values: contextValue,
  });

  useEffect(() => {
    if (!isInitialRender.current) return;

    if (initialItemsCount && fieldArrayProps.fields.length < initialItemsCount) {
      fieldArrayProps.append(
        new Array(initialItemsCount - fieldArrayProps.fields.length).fill(0).map(() => ({}))
      );
    }
    isInitialRender.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FieldArrayContext.Provider value={contextValue}>
      <div {...renderProps} />
    </FieldArrayContext.Provider>
  );
}
