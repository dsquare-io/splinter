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
      true: '',
      false: '',
    },
    isInvalid: {
      true: 'border-red-500 data-hover:border-red-500',
    },
    isDisabled: {
      true: 'border-zinc-950/20',
    },
    isGrouped: {
      true: 'flex-1 rounded-none border-0 bg-transparent shadow-none outline-none ring-0',
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
      isGrouped: false,
      class: 'hover:border-gray-400',
    },
    {
      isFocusWithin: true,
      isInvalid: false,
      isGrouped: false,
      class: 'ring-3 ring-brand-400/30 border-brand-500',
    },
    {
      isFocusWithin: true,
      isInvalid: true,
      isGrouped: false,
      class: 'ring-3 ring-red-400/30',
    },
  ],
  defaultVariants: {
    isInvalid: false,
    isFocusWithin: false,
    isGrouped: false,
    size: 'lg',
  },
});

export const inputGroupStyles = tv({
  base: [
    'relative flex w-full items-center rounded-md',
    'border border-gray-300 bg-white',
    'transition-colors duration-75',
    'hover:border-gray-400',
    'focus-within:ring-3 focus-within:ring-brand-400/30 focus-within:border-brand-500 focus-within:hover:border-brand-500',
    'has-[[data-slot=input-group-control][aria-invalid=true]]:border-red-500',
    'has-[[data-slot=input-group-control][aria-invalid=true]]:focus-within:ring-red-400/30',
  ],
});
