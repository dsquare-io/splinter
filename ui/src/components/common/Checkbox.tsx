import {ComponentProps, ReactNode} from 'react';
import {Checkbox as CheckboxPrimitive} from 'react-aria-components';

import {CheckIcon, MinusIcon} from '@heroicons/react/24/outline';
import {twMerge} from 'tailwind-merge';
import {VariantProps, tv} from 'tailwind-variants';

export const checkboxStyles = tv({
  base: [
    'shrink-0 inline-flex items-center justify-center border-[1.5px] ',
    'transition-colors duration-100 ease',
  ].join(' '),
  variants: {
    isFocused: {
      true: 'ring-3 ring-brand-400/30 in-data-focused:border-brand-500',
    },
    state: {
      disabled: 'border-neutral-300 peer-checked:bg-neutral-300 peer-checked:border-neutral-300',
      active: 'border-neutral-400 [[data-selected]>&]:bg-brand-700 [[data-selected]>&]:border-brand-700',
    },
    size: {
      large: 'h-5 w-5',
      small: 'h-4 w-4',
    },
    shape: {
      circle: 'rounded-full',
      square: 'rounded-sm',
    },
  },
  defaultVariants: {
    state: 'active',
    size: 'small',
    shape: 'square',
  },
});

type CheckboxProps = Omit<ComponentProps<typeof CheckboxPrimitive>, 'children' | 'className'> &
  Omit<VariantProps<typeof checkboxStyles>, 'state' | 'focus'> & {children?: ReactNode; className?: string};

export function Checkbox(props: CheckboxProps) {
  const {size = 'large', shape, isIndeterminate, children, className, isDisabled, ...restProps} = props;

  return (
    <CheckboxPrimitive
      className={twMerge('inline-flex cursor-pointer items-center gap-x-2', className)}
      isDisabled={isDisabled}
      isIndeterminate={isIndeterminate}
      {...restProps}
    >
      {({isFocused}) => (
        <>
          <div
            className={checkboxStyles({
              state: isDisabled ? 'disabled' : 'active',
              size,
              shape,
              isFocused
            })}
          >
            {isIndeterminate ? (
              <MinusIcon
                strokeWidth={3}
                strokeDasharray="15"
                strokeDashoffset="15"
                className="ease-out-cubic h-3 w-3 text-white transition-all duration-0 in-data-indeterminate:duration-150 in-data-indeterminate:[stroke-dashoffset:0]"
              />
            ) : (
              <CheckIcon
                strokeWidth={3}
                strokeDasharray="25"
                strokeDashoffset="25"
                className="ease-out-cubic h-3 w-3 text-white transition-all duration-0 in-data-selected:duration-150 in-data-selected:[stroke-dashoffset:0]"
              />
            )}
          </div>
          {children && <span>{children}</span>}
        </>
      )}
    </CheckboxPrimitive>
  );
}
