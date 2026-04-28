import { Context, ForwardedRef, RefObject, useContext, useEffect, useMemo } from 'react';
import { SlotProps } from 'react-aria-components';

import { mergeProps, mergeRefs, useObjectRef } from '@react-aria/utils';

export type WithRef<T, E> = T & { ref?: ForwardedRef<E> };

interface SlottedValue<T> {
  slots?: Record<string | symbol, T>;
  [slotCallbackSymbol]?: (value: T) => void;
}

export type ContextValue<T extends SlotProps, E extends Element> =
  | SlottedValue<WithRef<T, E>>
  | WithRef<T, E>
  | null
  | undefined;

export const slotCallbackSymbol = Symbol('callback');
export const defaultSlot = Symbol('default');

type CtxWithCallback<T, E extends Element> = WithRef<T, E> & {
  [slotCallbackSymbol]?: (value: T) => void;
};

export function useContextProps<T, U extends SlotProps, E extends Element>(
  props: T & SlotProps,
  ref: ForwardedRef<E>,
  context: Context<ContextValue<U, E>>
): [T, RefObject<E>] {
  const { ...ctx } = useContext(context) || {};

  const rootCtx = ctx as CtxWithCallback<U, E>;
  let defaultCtx: WithRef<U, E> | undefined;
  let slottedCtx: WithRef<U, E> | undefined;

  if ('slots' in ctx && ctx.slots) {
    slottedCtx = ctx.slots[props.slot ?? ''];

    // check for type/* slots
    if (!slottedCtx && 'type' in props && props.type) {
      slottedCtx = ctx.slots[`type/${props.type}`] || {};
    } else {
      slottedCtx = {} as WithRef<U, E>;
    }

    defaultCtx = ctx.slots[defaultSlot] || {};
  }

  if ('slots' in rootCtx) {
    delete rootCtx.slots;
  }

  const { ref: rootCtxRef, [slotCallbackSymbol]: rootCtxCallback, ...rootCtxProps } = rootCtx;
  const {
    ref: defaultCtxRef,
    [slotCallbackSymbol]: defaultCtxCallback,
    ...defaultCtxProps
  } = (defaultCtx || {}) as CtxWithCallback<U, E>;
  const {
    ref: slottedCtxRef,
    [slotCallbackSymbol]: slottedCtxCallback,
    ...slottedCtxProps
  } = (slottedCtx || {}) as CtxWithCallback<U, E>;

  const mergedRef = useObjectRef(
    useMemo(
      () => mergeRefs(ref, rootCtxRef!, defaultCtxRef!, slottedCtxRef!),
      [ref, rootCtxRef, defaultCtxRef, slottedCtxRef]
    )
  );
  const mergedProps = mergeProps(rootCtxProps, defaultCtxProps, slottedCtxProps, props) as unknown as T;

  // A parent component might need the props from a child, so call slot callback if needed.
  useEffect(() => {
    if (rootCtxCallback) {
      rootCtxCallback(props as unknown as U);
    }
    if (defaultCtxCallback) {
      defaultCtxCallback(props as unknown as U);
    }
    if (slottedCtxCallback) {
      slottedCtxCallback(props as unknown as U);
    }
  }, [rootCtxCallback, defaultCtxCallback, slottedCtxCallback, props]);

  return [mergedProps, mergedRef];
}
