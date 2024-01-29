import { composeRenderProps, Button as RACButton, ButtonProps as RACButtonProps } from 'react-aria-components';
import { tv, VariantProps } from 'tailwind-variants';
import { focusRing } from './utils';

const button = tv({
  extend: focusRing,
  base: [
    // Base
    'relative isolate inline-flex items-center justify-center gap-x-2 rounded-lg border text-base/6 font-semibold',

    // Sizing
    'px-[calc(theme(spacing[3.5])-1px)] py-[calc(theme(spacing[2.5])-1px)] sm:px-[calc(theme(spacing.3)-1px)] sm:py-[calc(theme(spacing[1.5])-1px)] sm:text-sm/6',

    // Disabled
    'data-[disabled]:opacity-50',

    // Icon
    '[&>[data-slot=icon]]:-mx-0.5 [&>[data-slot=icon]]:my-0.5 [&>[data-slot=icon]]:size-5 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-[--btn-icon] [&>[data-slot=icon]]:sm:my-1 [&>[data-slot=icon]]:sm:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:data-[hovered]:[--btn-icon:ButtonText]',
  ],
  variants: {
    isFocused: {
      true: 'outline-none',
    },
    isFocusVisible: {
      true: 'outline outline-2 outline-offset-2 outline-brand-500',
    },
    isPressed: {
      true: '',
    },
    variant: {
      solid: [
        // Optical border, implemented as the button background to avoid corner artifacts
        'border-transparent bg-[--btn-border]',

        // Dark mode: border is rendered on `after` so background is set to button background
        'dark:bg-[--btn-bg]',

        // Button background, implemented as foreground layer to stack on top of pseudo-border layer
        'before:absolute before:inset-0 before:-z-10 before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-[--btn-bg]',

        // Drop shadow, applied to the inset `before` layer so it blends with the border
        'before:shadow',

        // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
        'dark:before:hidden',

        // Dark mode: Subtle white outline is applied using a border
        'dark:border-white/5',

        // Shim/overlay, inset to match button foreground and used for hover state + highlight shadow
        'after:absolute after:inset-0 after:-z-10 after:rounded-[calc(theme(borderRadius.lg)-1px)]',

        // Inner highlight shadow
        'after:shadow-[shadow:inset_0_1px_theme(colors.white/15%)]',

        // White overlay on hover
        'after:data-[hovered]:bg-[--btn-hover-overlay]',

        // Dark mode: `after` layer expands to cover entire button
        'dark:after:-inset-px dark:after:rounded-lg',

        // Disabled
        'before:data-[disabled]:shadow-none after:data-[disabled]:shadow-none',
      ],
      outline: [
        // Base
        'border-zinc-950/10 text-zinc-950 data-[pressed]:bg-zinc-950/[2.5%] data-[hovered]:bg-zinc-950/[2.5%]',

        // Dark mode
        'dark:border-white/15 dark:text-white dark:[--btn-bg:transparent] dark:data-[pressed]:bg-white/5 dark:data-[hovered]:bg-white/5',

        // Icon
        '[--btn-icon:theme(colors.zinc.500)] data-[pressed]:[--btn-icon:theme(colors.zinc.700)] data-[hovered]:[--btn-icon:theme(colors.zinc.700)] dark:data-[pressed]:[--btn-icon:theme(colors.zinc.400)] dark:data-[hovered]:[--btn-icon:theme(colors.zinc.400)]',
      ],
      plain: [
        // Base
        'border-transparent text-zinc-950 data-[pressed]:bg-zinc-950/5 data-[hovered]:bg-zinc-950/5',

        // Dark mode
        'dark:text-white dark:data-[pressed]:bg-white/10 dark:data-[hovered]:bg-white/10',

        // Icon
        '[--btn-icon:theme(colors.zinc.500)] data-[pressed]:[--btn-icon:theme(colors.zinc.700)] data-[hovered]:[--btn-icon:theme(colors.zinc.700)] dark:[--btn-icon:theme(colors.zinc.500)] dark:data-[pressed]:[--btn-icon:theme(colors.zinc.400)] dark:data-[hovered]:[--btn-icon:theme(colors.zinc.400)]',
      ],
    },
    color: {
      secondary: [
        'text-zinc-950 [--btn-bg:white] [--btn-border:theme(colors.zinc.950/10%)] [--btn-hover-overlay:theme(colors.zinc.950/2.5%)] data-[pressed]:[--btn-border:theme(colors.zinc.950/15%)] data-[hovered]:[--btn-border:theme(colors.zinc.950/15%)]',
        'dark:[--btn-hover-overlay:theme(colors.zinc.950/5%)]',
        '[--btn-icon:theme(colors.zinc.400)] data-[pressed]:[--btn-icon:theme(colors.zinc.500)] data-[hovered]:[--btn-icon:theme(colors.zinc.500)]',
      ],
      primary: [
        'text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.brand.600)] [--btn-border:theme(colors.brand.700/90%)]',
        '[--btn-icon:theme(colors.white/60%)] data-[pressed]:[--btn-icon:theme(colors.white/80%)] data-[hovered]:[--btn-icon:theme(colors.white/80%)]',
      ],
      danger: [
        'text-white [--btn-hover-overlay:theme(colors.white/10%)] [--btn-bg:theme(colors.red.600)] [--btn-border:theme(colors.red.700/90%)]',
        '[--btn-icon:theme(colors.red.300)] data-[pressed]:[--btn-icon:theme(colors.red.200)] data-[hovered]:[--btn-icon:theme(colors.red.200)]',
      ],
    },
  },
  defaultVariants: {
    variant: 'solid',
    color: 'primary',
  },
});

export interface ButtonProps extends RACButtonProps, VariantProps<typeof button> {
}

export function Button(props: ButtonProps) {
  if (['submit', 'reset'].includes(props.type!) && !props.slot)
    props.slot = props.type;

  return (
    <RACButton
      {...props}
      className={composeRenderProps(
        props.className,
        (className, renderProps) => button({ ...renderProps, variant: props.variant, className }),
      )}
    />
  );
}
