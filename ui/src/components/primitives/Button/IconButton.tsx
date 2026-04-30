import {
  composeRenderProps,
  Button as RACButton,
  ButtonProps as RACButtonProps,
} from 'react-aria-components';

import { tv, VariantProps } from 'tailwind-variants';

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

export function IconButton({ color, variant, ...props }: IconButtonProps) {
  if (['submit', 'reset'].includes(props.type!) && !props.slot) props.slot = props.type;

  return (
    <RACButton
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        iconButtonStyles({ ...renderProps, variant, color, className })
      )}
    />
  );
}
