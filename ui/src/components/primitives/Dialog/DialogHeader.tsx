import clsx from 'clsx';
import { ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Heading, OverlayTriggerStateContext } from 'react-aria-components';

import { ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { IconButton } from '../Button';

type DialogHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  backButton?: boolean;
  prefix?: ReactNode;
  actions?: ReactNode;
};

export function DialogHeader({ title, description, backButton = false, prefix, actions }: DialogHeaderProps) {
  const { close } = useContext(OverlayTriggerStateContext)!;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    let root: Element | null = sentinel.parentElement;
    while (root && getComputedStyle(root).overflowY !== 'auto') {
      root = root.parentElement;
    }

    const observer = new IntersectionObserver(([entry]) => setIsStuck(!entry.isIntersecting), {
      root,
      threshold: [0],
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden
      />
      <div
        className={clsx(
          'sticky -top-4 z-20 -mx-4 -mt-4 flex gap-4 border-b border-gray-200 bg-white p-4 transition-shadow duration-200 focus:outline-hidden sm:-top-6 sm:-mx-6 sm:-mt-6 sm:p-6',
          backButton ? 'items-center' : 'items-start',
          isStuck && 'shadow-[0_1px_4px_0_rgb(0_0_0/0.08)]'
        )}
      >
        {backButton && (
          <IconButton
            variant="plain"
            aria-label="Go back"
            onPress={close}
            className="-ml-1 sm:hidden"
          >
            <ChevronLeftIcon className="size-5" />
          </IconButton>
        )}

        {prefix}

        <div className="flex-1 text-lg font-medium text-gray-900">
          <Heading slot="title">{title}</Heading>
          {description && <p className="text-sm text-neutral-500">{description}</p>}
        </div>

        {actions}

        <IconButton
          variant="plain"
          aria-label="Close Dialog"
          onPress={close}
          className={backButton ? 'max-sm:hidden' : undefined}
        >
          <XMarkIcon className="size-5" />
        </IconButton>
      </div>
    </>
  );
}
