import {Button as RACButton, ButtonProps as RACButtonProps, composeRenderProps} from 'react-aria-components';

import {VariantProps, tv} from 'tailwind-variants';

import {buttonBaseStyles} from './ButtonBase.tsx';

const button = tv({
  extend: buttonBaseStyles,
  base: [
    'relative inline-flex items-center justify-center gap-x-2 font-medium',
    '*:data-[slot=icon]:shrink-0',
  ],
  variants: {
    size: {
      large: 'px-3.5 py-1.5 text-sm/6 *:data-[slot=icon]:size-5',
      small: 'px-3 py-2 text-xs *:data-[slot=icon]:size-4',
    },
  },
  defaultVariants: {
    variant: 'solid',
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
