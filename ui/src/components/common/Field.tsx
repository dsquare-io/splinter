import {RefAttributes} from 'react';
import {
  type FieldErrorProps,
  Group,
  GroupProps,
  InputProps,
  LabelProps,
  Input as RACInput,
  Label as RACLabel,
  Text,
  TextProps,
  composeRenderProps,
} from 'react-aria-components';

import {FieldError as RACFieldError} from '@components/common/Form/FieldError.tsx';
import {twMerge} from 'tailwind-merge';
import {tv} from 'tailwind-variants';

import {composeTailwindRenderProps, focusRing} from './utils';

export function Label(props: LabelProps) {
  return (
    <RACLabel
      {...props}
      className={twMerge(
        'select-none text-base/6 text-zinc-950 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-white',
        props.className
      )}
    />
  );
}

export function Description(props: TextProps) {
  return (
    <Text
      {...props}
      slot="description"
      className={twMerge(
        'text-base/6 text-zinc-500 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-zinc-400',
        props.className
      )}
    />
  );
}

export function FieldError(props: FieldErrorProps) {
  return (
    <RACFieldError
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'text-base/6 text-red-600 data-[disabled]:opacity-50 sm:text-sm/6 dark:text-red-500'
      )}
    />
  );
}

export const fieldBorderStyles = tv({
  base: [
    // Basic layout
    'relative block w-full appearance-none rounded-lg px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing[3])-1px)] sm:py-[calc(theme(spacing[1.5])-1px)]',

    // Typography
    'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',

    // Border
    'border border-zinc-950/10 data-[hover]:border-zinc-950/20 dark:border-white/10 dark:data-[hover]:border-white/20',

    // Background color
    'bg-transparent dark:bg-white/5',

    // Hide default focus styles
    'focus:outline-none',
  ],
  variants: {
    isFocusWithin: {
      false: '',
      true: 'rounded-lg ring-inset ring-transparent sm:ring-2 sm:ring-brand-500',
    },
    isInvalid: {
      true: 'border-red-500 data-[hover]:border-red-500 dark:border-red-500 data-[hover]:dark:border-red-500',
    },
    isDisabled: {
      true: 'border-zinc-950/20 dark:data-[hover]:border-white/15 dark:border-white/15 dark:bg-white/[2.5%]',
    },
  },
});

export const fieldGroupStyles = tv({
  extend: focusRing,
  base: 'group flex items-center h-9 bg-white dark:bg-zinc-900 forced-colors:bg-[Field] border-2 rounded-lg overflow-hidden',
  variants: fieldBorderStyles.variants,
});

export function FieldGroup(props: GroupProps) {
  return (
    <Group
      {...props}
      className={composeRenderProps(props.className, (className, renderProps) =>
        fieldGroupStyles({
          ...renderProps,
          className,
        })
      )}
    />
  );
}

// why inpRef? just trying to avoid forwardRef here.
export function Input({inpRef, ...props}: InputProps & {inpRef?: RefAttributes<HTMLInputElement>['ref']}) {
  return (
    <RACInput
      ref={inpRef}
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        'min-w-0 flex-1 bg-white px-2 py-1.5 text-sm text-gray-800 outline outline-0 disabled:text-gray-200 dark:bg-zinc-900 dark:text-zinc-200 dark:disabled:text-zinc-600'
      )}
    />
  );
}
