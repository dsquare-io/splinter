import {tv} from 'tailwind-variants';

export const buttonBaseStyles = tv({
  base: [
    'rounded-md border transition-colors focus:outline-none',
    'data-[focus-visible]:ring-2 data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-[--ring]',
  ],
  variants: {
    variant: {
      plain: [
        'bg-transparent text-[--plain-text] border-transparent',
        'data-[hovered]:text-[--plain-text-hover] data-[hovered]:bg-[--plain]',
        'data-[focused]:text-[--plain-text-hover] data-[focused]:bg-[--plain]',
        'disabled:text-gray-400 disabled:bg-transparent',
      ],
      solid: [
        'text-white bg-[--solid] border-[--solid]',
        'data-[hovered]:bg-[--solid-hover] data-[hovered]:border-[--solid-hover]',
        'data-[focused]:bg-[--solid-hover] data-[focused]:border-[--solid-hover]',
        'disabled:text-gray-400 disabled:bg-gray-100 disabled:border-gray-200',
      ],
      outlined: [
        'text-[--plain-text] bg-[--plain] border-[--outline]',
        'data-[hovered]:text-[--plain-text-hover] data-[hovered]:bg-[--plain-hover]',
        'data-[focused]:text-[--plain-text-hover] data-[focused]:bg-[--plain-hover]',
        'disabled:text-gray-400 disabled:bg-white disabled:border-gray-200',
      ],
    },
    color: {
      default: [
        '[--solid:theme(colors.brand.600)] [--solid-hover:theme(colors.brand.700)]',
        '[--plain:theme(colors.gray.100)] [--plain-hover:theme(colors.gray.100)]',
        '[--plain-text:theme(colors.gray.700)] [--plain-text-hover:theme(colors.gray.800)]',
        '[--outline:theme(colors.gray.300)]',
        '[--ring:theme(colors.gray.400)]',
      ],
      brand: [
        '[--solid:theme(colors.brand.600)] [--solid-hover:theme(colors.brand.700)]',
        '[--plain:theme(colors.brand.50)] [--plain-hover:theme(colors.brand.100)]',
        '[--plain-text:theme(colors.brand.700)] [--plain-text-hover:theme(colors.brand.800)]',
        '[--outline:theme(colors.brand.300)]',
        '[--ring:theme(colors.brand.500)]',
      ],
      danger: [
        '[--solid:theme(colors.red.600)] [--solid-hover:theme(colors.red.700)]',
        '[--plain:theme(colors.red.600/5%)] [--plain-hover:theme(colors.red.600/15%)]',
        '[--plain-text:theme(colors.red.700)] [--plain-text-hover:theme(colors.red.800)]',
        '[--outline:theme(colors.red.300)]',
        '[--ring:theme(colors.red.400)]',
      ],
      info: [
        '[--solid:theme(colors.blue.600)] [--solid-hover:theme(colors.blue.700)]',
        '[--plain:theme(colors.blue.50)] [--plain-hover:theme(colors.blue.100)]',
        '[--plain-text:theme(colors.blue.700)] [--plain-text-hover:theme(colors.blue.800)]',
        '[--outline:theme(colors.blue.300)]',
        '[--ring:theme(colors.blue.400)]',
      ],
      warn: [
        '[--solid:theme(colors.yellow.500)] [--solid-hover:theme(colors.yellow.600)]',
        '[--plain:theme(colors.yellow.50)] [--plain-hover:theme(colors.yellow.100)]',
        '[--plain-text:theme(colors.yellow.700)] [--plain-text-hover:theme(colors.yellow.800)]',
        '[--outline:theme(colors.yellow.300)]',
        '[--ring:theme(colors.yellow.400)]',
      ],
      success: [
        '[--solid:theme(colors.green.500)] [--solid-hover:theme(colors.green.600)]',
        '[--plain:theme(colors.green.50)] [--plain-hover:theme(colors.green.100)]',
        '[--plain-text:theme(colors.green.700)] [--plain-text-hover:theme(colors.green.800)]',
        '[--outline:theme(colors.green.300)]',
        '[--ring:theme(colors.green.400)]',
      ],
    },
  },
  compoundVariants: [
    {
      color: 'default',
      variant: 'solid',
      className: '[--ring:theme(colors.brand.500)]'
    }
  ],
  defaultVariants: {
    color: 'default',
    variant: 'solid',
  },
})
