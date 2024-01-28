import {Context, ReactNode, useContext} from 'react';

import {defaultSlot} from './use-context-props';

type ProviderValue<T> = [Context<T>, T];
type ProviderValues<A, B, C, D, E, F, G, H> =
  | [ProviderValue<A>]
  | [ProviderValue<A>, ProviderValue<B>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>]
  | [ProviderValue<A>, ProviderValue<B>, ProviderValue<C>, ProviderValue<D>, ProviderValue<E>]
  | [
      ProviderValue<A>,
      ProviderValue<B>,
      ProviderValue<C>,
      ProviderValue<D>,
      ProviderValue<E>,
      ProviderValue<F>
    ]
  | [
      ProviderValue<A>,
      ProviderValue<B>,
      ProviderValue<C>,
      ProviderValue<D>,
      ProviderValue<E>,
      ProviderValue<F>,
      ProviderValue<G>
    ]
  | [
      ProviderValue<A>,
      ProviderValue<B>,
      ProviderValue<C>,
      ProviderValue<D>,
      ProviderValue<E>,
      ProviderValue<F>,
      ProviderValue<G>,
      ProviderValue<H>
    ];

interface ProviderProps<A, B, C, D, E, F, G, H> {
  values: ProviderValues<A, B, C, D, E, F, G, H>;
  children: ReactNode;
}

export function Provider<A, B, C, D, E, F, G, H>({
  values,
  children,
}: ProviderProps<A, B, C, D, E, F, G, H>): JSX.Element {
  for (const [ContextProvider, value] of values) {
    let slottedValue = value as {slots: Record<string, any>};

    if (!slottedValue.slots) {
      slottedValue = {
        slots: {
          [defaultSlot]: value,
        },
      };
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const contextValue = (useContext(ContextProvider as any) as typeof value) || {};
    const mergedValue = {...contextValue, ...slottedValue};

    // @ts-expect-error typeof value is hard to get right so not fixing it for now
    children = <ContextProvider.Provider value={mergedValue}>{children}</ContextProvider.Provider>;
  }

  return children as JSX.Element;
}
