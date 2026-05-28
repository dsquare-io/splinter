import { ComponentProps, MouseEvent } from 'react';

import { inputGroupStyles } from '@/components/primitives/Input/style.ts';

export function InputGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={inputGroupStyles({ className })}
      {...props}
    />
  );
}

export function InputGroupAddon({
  className,
  align = 'inline-end',
  onClick,
  ...props
}: ComponentProps<'div'> & { align?: 'inline-start' | 'inline-end' }) {
  function handleClick(e: MouseEvent<HTMLDivElement>) {
    onClick?.(e);
    if ((e.target as HTMLElement).closest('[data-slot=input-group-button]')) return;
    const input = e.currentTarget.closest('[data-slot=input-group]')?.querySelector<HTMLInputElement>(
      '[data-slot=input-group-control]'
    );
    input?.focus();
  }

  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={[
        'flex shrink-0 cursor-text items-center text-gray-400',
        align === 'inline-end' ? 'order-last pr-2' : 'order-first pl-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      {...props}
    />
  );
}

export function InputGroupButton({
  onMouseDown,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      data-slot="input-group-button"
      onMouseDown={(e) => {
        // Prevent focus leaving the input when clicking the button
        e.preventDefault();
        onMouseDown?.(e);
      }}
      {...props}
    />
  );
}
