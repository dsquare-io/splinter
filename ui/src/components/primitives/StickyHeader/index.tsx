import { useEffect, useRef, type ReactNode } from 'react';

import { twMerge } from 'tailwind-merge';

const STUCK_THRESHOLD = 30;

type StickyHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function StickyHeader({ children, className }: StickyHeaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    const header = headerRef.current;
    if (!el || !header) return;

    // Inside a scroll root (DetailHeader): sentinel is a descendant of the scroll container
    // Outside a scroll root (list headers): sentinel is inside a scroll-group that contains the scroll root as a sibling
    const container =
      el.closest<HTMLElement>('[data-scroll-root]') ??
      el.closest<HTMLElement>('[data-scroll-group]')?.querySelector<HTMLElement>('[data-scroll-root]');

    if (!container) return;

    const update = (t: number) => {
      header.style.setProperty('--stuck', String(t));
      if (t >= 1) header.setAttribute('data-stuck', '');
      else header.removeAttribute('data-stuck');
    };

    const onScroll = () => {
      update(Math.min(container.scrollTop / STUCK_THRESHOLD, 1));
    };

    // Un-stick when user scrolls up at scrollTop===0 (no scroll event fires in that case)
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0 && container.scrollTop === 0) update(0);
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0].clientY > touchStartY && container.scrollTop === 0) update(0);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        className="h-px"
      />
      <div
        ref={headerRef}
        className={twMerge('group sticky top-0 z-10 bg-white pr-3 pl-6 md:pl-8', className)}
        style={{ '--stuck': '0', paddingBlock: 'calc(1.5rem - var(--stuck) * 0.75rem)' } as React.CSSProperties}
      >
        {children}
      </div>
    </>
  );
}
