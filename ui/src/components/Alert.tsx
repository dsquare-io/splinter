import clsx from 'clsx';
import {ComponentProps} from 'react';
import {Heading} from 'react-aria-components';

export function AlertIcon({
  type = 'danger',
  className,
  ...props
}: ComponentProps<'div'> & {
  type?: 'danger' | 'warn' | 'info';
}) {
  return (
    <div
      {...props}
      className={clsx(
        '[&_[data-slot="icon"]]:size-6 mx-auto flex size-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 [grid-area:icon]',
        type === 'danger' && '[&_[data-slot="icon"]]:text-red-600 bg-red-100',
        type === 'warn' && '[&_[data-slot="icon"]]:text-yellow-700 bg-yellow-100',
        type === 'info' && '[&_[data-slot="icon"]]:text-blue-600 bg-blue-100',
        className
      )}
    />
  );
}

export function AlertContent(props: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        "grid-flow-row grid-cols-[auto_1fr] [grid-template-areas:'icon_title'_'icon_description'] sm:grid",
        props.className
      )}
    />
  );
}

export function AlertHeading(props: ComponentProps<typeof Heading>) {
  return (
    <Heading
      {...props}
      slot="title"
      className={clsx(
        'mt-3 text-base font-semibold leading-6 text-gray-900 [grid-area:title] sm:ml-3 sm:mt-0',
        props.className
      )}
    />
  );
}

export function AlertDescription(props: ComponentProps<'p'>) {
  return (
    <p
      {...props}
      className={clsx('mt-2 text-sm text-gray-500 [grid-area:description] sm:ml-3', props.className)}
    />
  );
}

export function AlertActions(props: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={clsx('mt-5 flex sm:flex-row sm:justify-end flex-col-reverse sm:mt-4 gap-4', props.className)}
    />
  );
}
