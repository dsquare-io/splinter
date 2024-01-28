import React from 'react';

// Adopted from react aria components
// https://github.com/adobe/react-spectrum/blob/main/packages/react-aria-components/src/utils.tsx#LL19C1

// eslint-disable-next-line @typescript-eslint/ban-types
declare function forwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement | null
): (props: P & React.RefAttributes<T>) => React.ReactElement | null;

export type forwardRefType = typeof forwardRef;
