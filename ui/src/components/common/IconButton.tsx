import {Button as RACButton, ButtonProps as RACButtonProps, composeRenderProps} from 'react-aria-components';

import {VariantProps, tv} from 'tailwind-variants';
import {buttonBaseStyles} from './ButtonBase.tsx';

export interface IconButtonProps extends RACButtonProps, VariantProps<typeof iconButtonStyles> {}

export function IconButton({color, variant, ...props}: IconButtonProps) {
  if (['submit', 'reset'].includes(props.type!) && !props.slot) props.slot = props.type;

  return (
    <RACButton
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        iconButtonStyles({...renderProps, variant, color, className})
      )}
    />
  );
}

const iconButtonStyles = tv({
  extend: buttonBaseStyles,
  base: [
    'p-2',
  ],
  defaultVariants: {
    color: 'default',
    variant: 'solid',
  },
});
