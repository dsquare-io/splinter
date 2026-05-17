import type { ComponentProps } from 'react';

import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { Link } from '@tanstack/react-router';

import { StickyHeader } from '../StickyHeader';
import clsx from 'clsx';

type DetailHeaderProps = {
  parentLink?: string;
  parentLabel?: string;
};

export function DetailHeader({
  children,
  parentLink,
  parentLabel,
  className,
  ...restProps
}: DetailHeaderProps & ComponentProps<typeof StickyHeader>) {
  return (
    <StickyHeader
      className={clsx(
        className,
        'grid grid-cols-[auto_1fr] items-center gap-x-5 border-b border-gray-900/5 px-4'
      )}
      {...restProps}
    >
      <div
        className="absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-full left-16 -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
          <div
            className="from-brand-600 aspect-1154/678 w-288.5 bg-linear-to-br to-[#9089FC]"
            style={{
              clipPath:
                'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
            }}
          ></div>
        </div>
      </div>

      {parentLink && parentLabel && (
        <div className="col-span-2">
          <Link
            className="text-brand-700 mb-1 inline-flex items-center gap-x-1.5 pb-4 text-sm font-medium xl:hidden"
            to={parentLink}
          >
            <ChevronLeftIcon className="size-3" />
            {parentLabel}
          </Link>
        </div>
      )}

      {children}
    </StickyHeader>
  );
}
