import { RefAttributes } from 'react';
import { composeRenderProps, InputProps, Input as RACInput } from 'react-aria-components';

import { tv } from 'tailwind-variants';

const fieldBorderStyles = tv({
  base: [
    'relative block w-full appearance-none rounded-md px-4',
    'text-base text-gray-950',
    'border border-gray-300',
    'bg-white',
    'focus:outline-hidden',
    'transition-colors duration-75',
  ],
  variants: {
    isFocusWithin: {
      true: 'ring-3',
    },
    isInvalid: {
      true: 'border-red-500 data-hover:border-red-500',
    },
    isDisabled: {
      true: 'border-zinc-950/20',
    },
    size: {
      lg: 'py-[8px]',
      sm: 'py-[5px]',
    },
  },
  compoundVariants: [
    {
      isFocusWithin: false,
      isInvalid: false,
      class: 'hover:border-gray-400',
    },
    {
      isFocusWithin: true,
      isInvalid: false,
      class: 'ring-brand-400/30 border-brand-500',
    },
    {
      isFocusWithin: true,
      isInvalid: true,
      class: 'ring-red-400/30',
    },
  ],
  defaultVariants: {
    isInvalid: false,
    isFocusWithin: false,
    size: 'lg',
  },
});

const inputStyles = tv({
  extend: fieldBorderStyles,
  base: [
    'min-w-0 flex-1 bg-white text-sm text-gray-800 outline outline-0 disabled:text-gray-200',
    'placeholder:text-gray-500',
  ],
});

export function Input({
  inpRef,
  ...props
}: InputProps & { inpRef?: RefAttributes<HTMLInputElement>['ref'] }) {
  return (
    <RACInput
      ref={inpRef}
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        inputStyles({
          ...renderProps,
          isFocusWithin: renderProps.isFocused,
          className,
        })
      )}
    />
  );
}
