import {
  composeRenderProps,
  Button as RACButton,
  ButtonProps as RACButtonProps,
} from 'react-aria-components';

import { tv, VariantProps } from 'tailwind-variants';

import { Spinner } from '../Spinner';
import { buttonBaseStyles } from './ButtonBase.tsx';

type IconButtonProps = RACButtonProps & VariantProps<typeof iconButtonStyles>;

const iconButtonStyles = tv({
  extend: buttonBaseStyles,
  base: ['p-2'],
  defaultVariants: {
    color: 'default',
    variant: 'solid',
  },
});

export function IconButton({
  color,
  variant,
  isPending,
  isDisabled,
  children,
  className,
  ...props
}: IconButtonProps) {
  if (['submit', 'reset'].includes(props.type!) && !props.slot) props.slot = props.type;

  return (
    <RACButton
      {...props}
      isPending={isPending}
      isDisabled={isPending || isDisabled}
      className={composeRenderProps(className, (className, renderProps) =>
        iconButtonStyles({ ...renderProps, variant, color, className })
      )}
    >
      {isPending ? <Spinner /> : children}
    </RACButton>
  );
}
