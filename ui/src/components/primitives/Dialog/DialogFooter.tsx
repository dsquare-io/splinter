import clsx from 'clsx';
import type { ReactNode } from 'react';

type DialogFooterProps = {
  className?: string;
  children: ReactNode;
};

export function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <>
      <div className="grow" />
      <div
        className={clsx(
          'z-10 -mx-4 mt-auto border-neutral-200 bg-white px-4 max-sm:sticky max-sm:inset-x-0 max-sm:-bottom-4 max-sm:border-t max-sm:py-4 sm:-mx-6 sm:px-6',
          className
        )}
      >
        {children}
      </div>
    </>
  );
}
