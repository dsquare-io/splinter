import {Button as RACButton, ButtonProps as RACButtonProps, composeRenderProps} from 'react-aria-components';

import {VariantProps, tv} from 'tailwind-variants';

import {focusRing} from './utils';

const button = tv({
  extend: focusRing,
  base: [
    // Base
    'relative isolate inline-flex items-center justify-center gap-x-2 rounded-md border text-base/6 font-medium',

    'transitions-colors duration-75',

    // Disabled
    'data-[disabled]:opacity-50',

    // Icon
    '  [&>[data-slot=icon]]:shrink-0 [where(&>[data-slot=icon])]:text-[--btn-icon] forced-colors:[--btn-icon:ButtonText] forced-colors:data-[hovered]:[--btn-icon:ButtonText]',
  ],
  variants: {
    size: {
      large: 'px-3.5 py-2.5 sm:py-1.5 sm:text-sm/6 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:my-0.5',
      small: 'px-3 py-2 text-xs [&>[data-slot=icon]]:size-4',
    },
    isFocused: {
      true: 'outline-none',
    },
    isFocusVisible: {
      true: 'outline outline-2 outline-offset-2 outline-brand-500',
    },
    isPressed: {
      true: '',
    },
    variant: {
      solid: ['border-transparent bg-[--btn-border]'],
      outline: ['text-gray-950'],
      plain: [
        // Base
        'border-transparent text-gray-950 data-[pressed]:bg-zinc-950/5 data-[hovered]:bg-zinc-950/5',

        // Icon
        '[--btn-icon:theme(colors.zinc.500)] data-[pressed]:[--btn-icon:theme(colors.zinc.700)] data-[hovered]:[--btn-icon:theme(colors.zinc.700)] dark:[--btn-icon:theme(colors.zinc.500)] dark:data-[pressed]:[--btn-icon:theme(colors.zinc.400)] dark:data-[hovered]:[--btn-icon:theme(colors.zinc.400)]',
      ],
    },
    color: {
      primary: '',
      danger: '',
    },
  },
  compoundVariants: [
    {
      color: 'primary',
      variant: 'solid',
      class: [
        // Base
        'text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.brand.600)] [--btn-border:theme(colors.brand.700/90%)]',

        // Icon
        '[--btn-icon:theme(colors.white)] data-[pressed]:[--btn-icon:theme(colors.white)] data-[hovered]:[--btn-icon:theme(colors.white)]',
      ],
    },
    {
      color: 'primary',
      variant: 'outline',
      class: [
        // Base
        'border-gray-300 data-[hovered]:border-gray-400 data-[hovered]:bg-gray-100',

        // Icon
        '[--btn-icon:theme(colors.gray.600)]',
      ],
    },
    {
      color: 'danger',
      variant: 'solid',
      class: [
        // Base
        'text-white [--btn-border:theme(colors.red.600)]',

        // Icon
        '[--btn-icon:theme(colors.white)]',
      ],
    },
    {
      color: 'danger',
      variant: 'outline',
      class: [
        // Base
        'border-red-400 data-[hovered]:border-red-500 data-[hovered]:bg-red-50',

        // Icon
        '[--btn-icon:theme(colors.red.500)] data-[hovered]:[--btn-icon:theme(colors.red.600)]',
      ],
    },
  ],
  defaultVariants: {
    variant: 'solid',
    color: 'primary',
    size: 'large',
  },
});

export interface ButtonProps extends RACButtonProps, VariantProps<typeof button> {}

export function Button({variant, color, size, ...props}: ButtonProps) {
  if (['submit', 'reset'].includes(props.type!) && !props.slot) props.slot = props.type;

  return (
    <RACButton
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        button({...renderProps, variant, color, size, className})
      )}
    />
  );
}
