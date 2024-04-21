import type {ReactElement, ReactNode} from 'react';
import {useWatch} from 'react-hook-form';
import {useScopedFieldName} from './FieldScope.tsx';

interface Props {
  name?: string;
  hideIfNull?: boolean;
  showIf?: any;
  children: ((value: any) => ReactNode) | ReactNode;
}

export function WatchState({name, children, showIf, hideIfNull = false}: Props): ReactNode | null {
  const scopedName = useScopedFieldName(name);
  const state = useWatch({name: scopedName});

  if (hideIfNull && [null, undefined].includes(state as any)) {
    return null;
  }

  if (showIf) {
    if (showIf === state) {
      return children as ReactElement;
    }
    return null;
  }

  return typeof children === 'function' ? children(state) : children;
}
