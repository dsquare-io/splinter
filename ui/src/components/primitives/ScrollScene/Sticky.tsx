import { type ComponentPropsWithoutRef } from 'react';

import { twMerge } from 'tailwind-merge';

export function ScrollSceneSticky({ className, style, children, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={twMerge('sticky', className)}
      style={{ top: 'var(--scroll-scene-header-height)', ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
