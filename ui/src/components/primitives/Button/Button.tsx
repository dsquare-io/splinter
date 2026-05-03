import {
  composeRenderProps,
  Button as RACButton,
  ButtonProps as RACButtonProps,
} from 'react-aria-components';

import { tv, VariantProps } from 'tailwind-variants';

import { buttonBaseStyles } from './ButtonBase.tsx';
import { Spinner } from './Spinner.tsx';

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

type ButtonProps = RACButtonProps & VariantProps<typeof button>;

export function Button({ variant, color, size, isPending, children, className, ...props }: ButtonProps) {
  if (['submit', 'reset'].includes(props.type!) && !props.slot) props.slot = props.type;

  return (
    <RACButton
      isPending={isPending}
      className={composeRenderProps(className, (className, renderProps) =>
        button({ ...renderProps, variant, color, size, className })
      )}
      {...props}
    >
      {isPending ? <Spinner /> : children}
    </RACButton>
  );
}
