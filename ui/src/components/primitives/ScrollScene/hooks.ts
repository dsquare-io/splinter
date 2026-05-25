/* eslint-disable react-hooks/refs */
import { useEffect, useRef } from 'react';

import {
  motionValue,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'framer-motion';

import { useScrollY } from './context.ts';

type ScrollAnimateConfig = { range: [number, number] } & Record<string, [number, number]>;

export function useScrollAnimate({
  range,
  ...props
}: ScrollAnimateConfig): Record<string, MotionValue<number>> {
  const scrollY = useScrollY();
  const configRef = useRef({ range, props });
  configRef.current = { range, props };

  const styleRef = useRef<Record<string, MotionValue<number>> | null>(null);

  if (!styleRef.current) {
    const [from, to] = range;
    const initial = scrollY.get();
    const progress = to !== from ? Math.max(0, Math.min(1, (initial - from) / (to - from))) : 0;
    styleRef.current = Object.fromEntries(
      Object.entries(props).map(([key, [start, end]]) => [key, motionValue(start + (end - start) * progress)])
    );
  }

  useMotionValueEvent(scrollY, 'change', (v) => {
    const {
      range: [from, to],
      props,
    } = configRef.current;
    const progress = to !== from ? Math.max(0, Math.min(1, (v - from) / (to - from))) : 0;
    for (const [key, [start, end]] of Object.entries(props)) {
      styleRef.current![key]?.set(start + (end - start) * progress);
    }
  });

  return styleRef.current;
}

export function useHideOnScroll(range: [number, number]) {
  const scrollY = useScrollY();
  const measuredHeight = useRef(0);
  const rangeRef = useRef(range);
  rangeRef.current = range;
  const ref = useRef<HTMLElement | null>(null);

  const height = useMotionValue(0);
  const opacity = useTransform(scrollY, range, [1, 0]);

  const computeHeight = (v: number) => {
    const [from, to] = rangeRef.current;
    const progress = to !== from ? Math.max(0, Math.min(1, (v - from) / (to - from))) : 0;
    return measuredHeight.current * (1 - progress);
  };

  useMotionValueEvent(scrollY, 'change', (v) => {
    height.set(computeHeight(v));
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const naturalHeight = (entry.target as HTMLElement).scrollHeight;
      if (naturalHeight > 0 && naturalHeight !== measuredHeight.current) {
        measuredHeight.current = naturalHeight;
        height.set(computeHeight(scrollY.get()));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ref,
    style: { height, opacity, overflow: 'hidden' as const },
  };
}
