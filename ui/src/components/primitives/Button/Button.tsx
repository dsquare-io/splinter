import {
  composeRenderProps,
  Button as RACButton,
  ButtonProps as RACButtonProps,
} from 'react-aria-components';

import { tv, VariantProps } from 'tailwind-variants';

import { Spinner } from '../Spinner';
import { buttonBaseStyles } from './ButtonBase.tsx';

const button = tv({
  extend: buttonBaseStyles,
  base: [
    'relative inline-flex items-center justify-center gap-x-2 font-medium overflow-hidden',
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
      {composeRenderProps(children, (resolvedChildren) => (
        <>
          {resolvedChildren}
          {isPending && (
            <div className="absolute top-0 left-0 flex h-full w-full cursor-default items-center justify-center bg-inherit">
              <Spinner />
            </div>
          )}
        </>
      ))}
    </RACButton>
  );
}
