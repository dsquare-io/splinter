import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { animate, motion, useMotionValue, useMotionValueEvent } from 'framer-motion';

import { useScrollY } from '../ScrollScene';
import { PullSpinner } from './PullSpinner.tsx';

const THRESHOLD = 70;
const MAX_PULL = 90;
const RESISTANCE = 0.4;
const REFRESH_HEIGHT = 52;
const TOTAL_SPOKES = 12;
const MIN_DELAY = 500;

type Props = {
  onRefresh: () => unknown;
  children: ReactNode;
};

export function PullToRefresh({ onRefresh, children }: Props) {
  const scrollY = useScrollY();
  const indicatorHeight = useMotionValue(0);
  const [activeSpokes, setActiveSpokes] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const onRefreshRef = useRef(onRefresh);
  useLayoutEffect(() => {
    onRefreshRef.current = onRefresh;
  });

  useMotionValueEvent(indicatorHeight, 'change', (height) => {
    if (isRefreshingRef.current) return;
    const next = Math.round(Math.min(height / THRESHOLD, 1) * TOTAL_SPOKES);
    setActiveSpokes((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleTouchStart(e: TouchEvent) {
      if (scrollY.get() > 0 || isRefreshingRef.current) return;
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }

    function handleTouchMove(e: TouchEvent) {
      if (!isPullingRef.current) return;
      if (scrollY.get() > 0) {
        isPullingRef.current = false;
        indicatorHeight.set(0);
        return;
      }
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta > 0) {
        e.preventDefault();
        indicatorHeight.set(Math.min(delta * RESISTANCE, MAX_PULL));
      } else {
        isPullingRef.current = false;
        indicatorHeight.set(0);
      }
    }

    function handleTouchEnd() {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;

      const dist = indicatorHeight.get();

      if (dist >= THRESHOLD && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setActiveSpokes(TOTAL_SPOKES);
        animate(indicatorHeight, REFRESH_HEIGHT, { type: 'spring', stiffness: 400, damping: 35 });
        const result = onRefreshRef.current();
        const promise = result instanceof Promise ? result : Promise.resolve();
        const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_DELAY));
        Promise.all([promise, minDelay]).finally(() => {
          animate(indicatorHeight, 0, { type: 'spring', stiffness: 400, damping: 35 }).then(() => {
            isRefreshingRef.current = false;
            setIsRefreshing(false);
            setActiveSpokes(0);
          });
        });
      } else {
        animate(indicatorHeight, 0, { type: 'spring', stiffness: 400, damping: 35 });
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [scrollY, indicatorHeight]);

  return (
    <div ref={containerRef}>
      <motion.div
        style={{ height: indicatorHeight }}
        className="flex items-center justify-center overflow-hidden"
      >
        <PullSpinner
          activeSpokes={activeSpokes}
          isRefreshing={isRefreshing}
          totalSpokes={TOTAL_SPOKES}
        />
      </motion.div>
      {children}
    </div>
  );
}
