import {tv} from 'tailwind-variants';

export const buttonBaseStyles = tv({
  base: [
    'rounded-md border transition-colors focus:outline-hidden',
    'data-focus-visible:ring-2 data-focus-visible:ring-offset-2 data-focus-visible:ring-(--ring)',
  ],
  variants: {
    variant: {
      plain: [
        'bg-transparent text-(--plain-text) border-transparent',
        'data-hovered:text-(--plain-text-hover) data-hovered:bg-(--plain)',
        'data-focused:text-(--plain-text-hover) data-focused:bg-(--plain)',
        'disabled:text-gray-400 disabled:bg-transparent',
      ],
      solid: [
        'text-white bg-(--solid) border-(--solid)',
        'data-hovered:bg-(--solid-hover) data-hovered:border-(--solid-hover)',
        'data-focused:bg-(--solid-hover) data-focused:border-(--solid-hover)',
        'disabled:text-gray-400 disabled:bg-gray-100 disabled:border-gray-200',
      ],
      outlined: [
        'text-(--plain-text) bg-(--plain) border-(--outline)',
        'data-hovered:text-(--plain-text-hover) data-hovered:bg-(--plain-hover)',
        'data-focused:text-(--plain-text-hover) data-focused:bg-(--plain-hover)',
        'disabled:text-gray-400 disabled:bg-white disabled:border-gray-200',
      ],
    },
    color: {
      default: [
        '[--solid:var(--color-brand-600)] [--solid-hover:var(--color-brand-700)]',
        '[--plain:var(--color-gray-100)] [--plain-hover:var(--color-gray-100)]',
        '[--plain-text:var(--color-gray-700)] [--plain-text-hover:var(--color-gray-800)]',
        '[--outline:var(--color-gray-300)]',
        '[--ring:var(--color-gray-400)]',
      ],
      brand: [
        '[--solid:var(--color-brand-600)] [--solid-hover:var(--color-brand-700)]',
        '[--plain:var(--color-brand-50)] [--plain-hover:var(--color-brand-100)]',
        '[--plain-text:var(--color-brand-700)] [--plain-text-hover:var(--color-brand-800)]',
        '[--outline:var(--color-brand-300)]',
        '[--ring:var(--color-brand-500)]',
      ],
      danger: [
        '[--solid:var(--color-red-600)] [--solid-hover:var(--color-red-700)]',
        '[--plain:var(--color-red-600)]/5 [--plain-hover:var(--color-red-600)]/15',
        '[--plain-text:var(--color-red-700)] [--plain-text-hover:var(--color-red-800)]',
        '[--outline:var(--color-red-300)]',
        '[--ring:var(--color-red-400)]',
      ],
      info: [
        '[--solid:var(--color-blue-600)] [--solid-hover:var(--color-blue-700)]',
        '[--plain:var(--color-blue-50)] [--plain-hover:var(--color-blue-100)]',
        '[--plain-text:var(--color-blue-700)] [--plain-text-hover:var(--color-blue-800)]',
        '[--outline:var(--color-blue-300)]',
        '[--ring:var(--color-blue-400)]',
      ],
      warn: [
        '[--solid:var(--color-yellow-500)] [--solid-hover:var(--color-yellow-600)]',
        '[--plain:var(--color-yellow-50)] [--plain-hover:var(--color-yellow-100)]',
        '[--plain-text:var(--color-yellow-700)] [--plain-text-hover:var(--color-yellow-800)]',
        '[--outline:var(--color-yellow-300)]',
        '[--ring:var(--color-yellow-400)]',
      ],
      success: [
        '[--solid:var(--color-green-500)] [--solid-hover:var(--color-green-600)]',
        '[--plain:var(--color-green-50)] [--plain-hover:var(--color-green-100)]',
        '[--plain-text:var(--color-green-700)] [--plain-text-hover:var(--color-green-800)]',
        '[--outline:var(--color-green-300)]',
        '[--ring:var(--color-green-400)]',
      ],
    },
  },
  compoundVariants: [
    {
      color: 'default',
      variant: 'solid',
      className: '[--ring:var(--color-brand-500)]'
    }
  ],
  defaultVariants: {
    color: 'default',
    variant: 'solid',
  },
})
