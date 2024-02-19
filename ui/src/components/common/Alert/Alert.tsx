import * as React from 'react';

import {twMerge} from 'tailwind-merge';
import {VariantProps, tv} from 'tailwind-variants';

const alertVariants = tv({
  base: 'alert relative w-full rounded-md border px-4 py-3 text-sm',
  variants: {
    variant: {
      default: 'bg-white text-gray-900',
      destructive: 'border-red-400 text-red-600 [&>svg]:text-red-600',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({className, variant, ...props}, ref) => (
  <div
    ref={ref}
    role="alert"
    className={twMerge(alertVariants({variant}), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({className, ...props}, ref) => (
    <h5
      ref={ref}
      slot="title"
      className={twMerge('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({className, ...props}, ref) => (
    <div
      ref={ref}
      slot="title"
      className={twMerge('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export {Alert, AlertTitle, AlertDescription};
