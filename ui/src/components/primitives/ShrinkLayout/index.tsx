/* eslint-disable react-hooks/refs */
import { createContext, useContext, useEffect, useRef, type ComponentPropsWithoutRef } from 'react';

import {
  motion,
  motionValue,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { twMerge } from 'tailwind-merge';

// ---- Context ----

interface ShrinkLayoutContextValue {
  scrollY: MotionValue<number>;
  headerHeight: MotionValue<number>;      // frozen at scroll=0; drives Content paddingTop
  currentHeaderHeight: MotionValue<number>; // live animated height; drives CSS var for Sticky
}

const ShrinkLayoutContext = createContext<ShrinkLayoutContextValue | null>(null);

function useShrinkLayoutContext() {
  const ctx = useContext(ShrinkLayoutContext);
  if (!ctx) throw new Error('Must be used within ShrinkLayout');
  return ctx;
}

export function useScrollY(): MotionValue<number> {
  return useShrinkLayoutContext().scrollY;
}

// ---- useScrollAnimate ----

type ScrollAnimateConfig = { range: [number, number] } & Record<string, [number, number]>;

export function useScrollAnimate({ range, ...props }: ScrollAnimateConfig): Record<string, MotionValue<number>> {
  const scrollY = useScrollY();
  const configRef = useRef({ range, props });
  configRef.current = { range, props };

  const styleRef = useRef<Record<string, MotionValue<number>> | null>(null);

  if (!styleRef.current) {
    const [from, to] = range;
    const initial = scrollY.get();
    const progress = to !== from ? Math.max(0, Math.min(1, (initial - from) / (to - from))) : 0;
    styleRef.current = Object.fromEntries(
      Object.entries(props).map(([key, [start, end]]) => [
        key,
        motionValue(start + (end - start) * progress),
      ]),
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

// ---- useHideOnScroll ----

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

// ---- ShrinkLayout (Root) ----

function ShrinkLayoutRoot({ className, children, ...props }: ComponentPropsWithoutRef<'div'>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMotionValue(0);
  const currentHeaderHeight = useMotionValue(0);
  const { scrollY } = useScroll({ container: rootRef });

  useMotionValueEvent(currentHeaderHeight, 'change', (v) => {
    rootRef.current?.style.setProperty('--shrink-layout-header-height', `${v}px`);
  });

  return (
    <ShrinkLayoutContext.Provider value={{ scrollY, headerHeight, currentHeaderHeight }}>
      <div
        ref={rootRef}
        className={twMerge('overflow-auto', className)}
        {...props}
      >
        {children}
      </div>
    </ShrinkLayoutContext.Provider>
  );
}

// ---- ShrinkLayout.Header ----

type ShrinkLayoutHeaderProps = {
  range?: [number, number];
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
};

function ShrinkLayoutHeader({ className, children, range, ...rest }: ShrinkLayoutHeaderProps) {
  const { scrollY, headerHeight, currentHeaderHeight } = useShrinkLayoutContext();
  const innerRef = useRef<HTMLDivElement>(null);

  const animProps: Record<string, [number, number]> = {};
  const divProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (isAnimProp(value)) animProps[key] = value;
    else divProps[key] = value;
  }

  const animatedStyle = useScrollAnimate({ range: range ?? [0, 1], ...animProps });

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      if (h > 0) {
        currentHeaderHeight.set(h);
        if (scrollY.get() === 0) {
          headerHeight.set(h);
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollY, headerHeight, currentHeaderHeight]);

  return (
    <div className="sticky top-0 z-10 h-0">
      <motion.div
        ref={innerRef as React.RefObject<HTMLDivElement>}
        className={twMerge('absolute inset-x-0 top-0', className)}
        style={animatedStyle as React.CSSProperties}
        {...(divProps as object)}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ---- ShrinkLayout.Content ----

function ShrinkLayoutContent({ className, style, children, ...props }: ComponentPropsWithoutRef<'div'>) {
  const { headerHeight } = useShrinkLayoutContext();

  return (
    <motion.div
      className={className}
      style={{ paddingTop: headerHeight, ...(style as object) } as React.CSSProperties}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ---- ShrinkLayout.Sticky ----

function ShrinkLayoutSticky({ className, style, children, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={twMerge('sticky', className)}
      style={{ top: 'var(--shrink-layout-header-height)', ...(style as object) }}
      {...props}
    >
      {children}
    </div>
  );
}

// ---- ShrinkLayout.Animate ----

function isAnimProp(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number';
}

type ShrinkLayoutAnimateProps = {
  range: [number, number];
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  [key: string]: unknown;
};

function ShrinkLayoutAnimate({ range, className, style, children, ...rest }: ShrinkLayoutAnimateProps) {
  const animProps: Record<string, [number, number]> = {};
  const divProps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (isAnimProp(value)) {
      animProps[key] = value;
    } else {
      divProps[key] = value;
    }
  }

  const animatedStyle = useScrollAnimate({ range, ...animProps });

  return (
    <motion.div
      className={className}
      style={{ ...animatedStyle, ...(style as object) } as React.CSSProperties}
      {...(divProps as ComponentPropsWithoutRef<'div'>)}
    >
      {children}
    </motion.div>
  );
}

// ---- ShrinkLayout.Hide ----

interface ShrinkLayoutHideProps extends ComponentPropsWithoutRef<'div'> {
  range: [number, number];
}

function ShrinkLayoutHide({ range, className, style, children, ...props }: ShrinkLayoutHideProps) {
  const { ref, style: hideStyle } = useHideOnScroll(range);

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{ ...hideStyle, ...(style as object) } as React.CSSProperties}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// ---- Export ----

export const ShrinkLayout = Object.assign(ShrinkLayoutRoot, {
  Header: ShrinkLayoutHeader,
  Content: ShrinkLayoutContent,
  Sticky: ShrinkLayoutSticky,
  Animate: ShrinkLayoutAnimate,
  Hide: ShrinkLayoutHide,
});
