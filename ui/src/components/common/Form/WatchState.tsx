import type {ReactElement} from 'react';
import {useWatch} from 'react-hook-form';

interface Props {
  name?: string | readonly string[];
  hideIfNull?: boolean;
  showIf?: any;
  children: ((value: any) => ReactElement) | ReactElement;
}

export function WatchState({name, children, showIf, hideIfNull = false}: Props): ReactElement | null {
  // TODO: review this type error
  // @ts-ignore
  const state = useWatch({name});

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
