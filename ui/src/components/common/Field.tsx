import clsx from 'clsx';
import {RefAttributes} from 'react';
import {
  type FieldErrorProps,
  InputProps,
  LabelProps,
  Input as RACInput,
  Label as RACLabel,
  Text,
  TextProps,
  composeRenderProps,
} from 'react-aria-components';

import {AnimatePresence, motion} from 'framer-motion';
import {twMerge} from 'tailwind-merge';
import {tv} from 'tailwind-variants';

import {FieldError as RACFieldError} from '@/components/common/Form/FieldError';

export function Label(props: LabelProps) {
  return (
    <RACLabel
      {...props}
      className={twMerge('mb-1 block text-sm font-bold leading-relaxed text-gray-800', props.className)}
    />
  );
}

export function Description(props: TextProps) {
  return (
    <Text
      {...props}
      slot="description"
      className={twMerge('mt-1.5 block text-xs text-gray-600', props.className)}
    />
  );
}

export function FieldError({className, ...props}: FieldErrorProps) {
  return (
    <RACFieldError
      {...props}
      className="contents"
    >
      {(validationError, renderProps) => (
        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{opacity: 0, height: 0, marginTop: 0}}
              animate={{opacity: 1, height: 'auto', marginTop: 4}}
              exit={{opacity: 0, height: 0, marginTop: 0}}
              className={clsx(
                typeof className === 'function'
                  ? className({...renderProps, defaultClassName: ''})
                  : className,
                'mt-1.5 block text-xs text-red-600'
              )}
            >
              {validationError}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </RACFieldError>
  );
}

export const fieldBorderStyles = tv({
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

export const inputStyles = tv({
  extend: fieldBorderStyles,
  base: [
    'min-w-0 flex-1 bg-white text-sm text-gray-800 outline outline-0 disabled:text-gray-200',
    'placeholder:text-gray-500',
  ],
});

export function Input({inpRef, ...props}: InputProps & {inpRef?: RefAttributes<HTMLInputElement>['ref']}) {
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
