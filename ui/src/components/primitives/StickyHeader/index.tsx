import { useEffect, useRef, useState, type ReactNode } from 'react';

import { twMerge } from 'tailwind-merge';

type StickyHeaderProps = {
  children: ReactNode;
  className?: string;
};

export function StickyHeader({ children, className }: StickyHeaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    // Inside a scroll root (DetailHeader): sentinel is a descendant of the scroll container
    // Outside a scroll root (list headers): sentinel is inside a scroll-group that contains the scroll root as a sibling
    const container =
      el.closest<HTMLElement>('[data-scroll-root]') ??
      el.closest<HTMLElement>('[data-scroll-group]')?.querySelector<HTMLElement>('[data-scroll-root]');

    if (!container) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container!;
      if (scrollTop > 0) {
        setIsStuck(true);
      } else if (scrollHeight > clientHeight) {
        setIsStuck(false);
      }
      // scrollTop===0 && fits: browser clamped — stay stuck, handled by wheel/touch below
    };

    // Un-stick when user scrolls up at scrollTop===0 (no scroll event fires in that case)
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < 0 && container!.scrollTop === 0) setIsStuck(false);
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0].clientY > touchStartY && container!.scrollTop === 0) setIsStuck(false);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      container!.removeEventListener('scroll', onScroll);
      container!.removeEventListener('wheel', onWheel);
      container!.removeEventListener('touchstart', onTouchStart);
      container!.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        className="h-px"
      />
      <div
        className={twMerge(
          'group sticky top-0 z-10 bg-white py-6 pr-3 pl-6 transition-[padding] duration-200 data-stuck:py-3 md:pl-8',
          className
        )}
        data-stuck={isStuck || undefined}
      >
        {children}
      </div>
    </>
  );
}
