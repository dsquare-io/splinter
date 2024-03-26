import {ReactElement, ReactNode, cloneElement, useMemo} from 'react';

import {CollectionBase} from '@react-types/shared';

interface CachedChildrenOptions<T> extends Omit<CollectionBase<T>, 'children'> {
  /** The contents of the collection. */
  children?: ReactNode | ((item: T) => ReactNode);
  keyName?: string;
}

export function useCachedChildren<T extends object>(props: CachedChildrenOptions<T>): ReactNode {
  const {children, items, keyName = 'id'} = props;

  // Invalidate the cache whenever the parent value changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cache = useMemo(() => new Map(), [keyName]);
  return useMemo(() => {
    if (items && typeof children === 'function') {
      const res: ReactElement[] = [];
      for (const item of items) {
        let rendered = cache.get(item);
        if (!rendered) {
          rendered = children(item);
          // @ts-ignore
          const key = item[keyName];
          if (key == null) {
            throw new Error('Could not determine key for item');
          }

          // Note: only works if wrapped Item passes through id...
          rendered = cloneElement(rendered, {key, id: key, value: item});
          cache.set(key, rendered);
        }
        res.push(rendered);
      }
      return res;
    } else if (typeof children !== 'function') {
      return children;
    }
  }, [children, items, cache, keyName]);
}
