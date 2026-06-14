import { RefAttributes } from 'react';
import { composeRenderProps, InputProps, Input as RACInput } from 'react-aria-components';

import { tv } from 'tailwind-variants';

import { fieldBorderStyles } from './style.ts';

const inputStyles = tv({
  extend: fieldBorderStyles,
  base: [
    'min-w-0 flex-1 bg-white text-base sm:text-sm text-gray-800 outline outline-0 disabled:text-gray-200',
    'placeholder:text-gray-500',
  ],
});

export function Input({
  inpRef,
  isGrouped,
  ...props
}: InputProps & { inpRef?: RefAttributes<HTMLInputElement>['ref']; isGrouped?: boolean }) {
  return (
    <RACInput
      ref={inpRef}
      data-slot={isGrouped ? 'input-group-control' : undefined}
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        inputStyles({
          ...renderProps,
          isFocusWithin: renderProps.isFocused,
          isGrouped,
          className,
        })
      )}
    />
  );
}
