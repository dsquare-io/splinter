import { tv } from 'tailwind-variants';

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
