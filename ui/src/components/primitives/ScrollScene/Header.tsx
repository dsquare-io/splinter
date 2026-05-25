import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';

import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

import { useScrollSceneContext } from './context.ts';
import { useScrollAnimate } from './hooks.ts';
import { isAnimProp } from './utils.ts';

type ScrollSceneHeaderProps = {
  range?: [number, number];
  className?: string;
  children?: ReactNode;
  variant?: 'primary' | 'secondary';
  [key: string]: unknown;
};

export function ScrollSceneHeader({
  className,
  children,
  range,
  variant = 'secondary',
  ...rest
}: ScrollSceneHeaderProps) {
  const { scrollY, headerHeight, currentHeaderHeight } = useScrollSceneContext();
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
    observer.observe(el, { box: 'border-box' });
    return () => observer.disconnect();
  }, [scrollY, headerHeight, currentHeaderHeight]);

  return (
    <div className="sticky top-0 z-20 h-0">
      <motion.div
        ref={innerRef as RefObject<HTMLDivElement>}
        className={twMerge('absolute inset-x-0 top-0 bg-white', className)}
        style={animatedStyle as CSSProperties}
        {...(divProps as object)}
      >
        {variant === 'primary' && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute top-full left-16 -mt-16 transform-gpu opacity-50 blur-3xl xl:left-1/2 xl:-ml-80">
              <div
                className="from-brand-600 aspect-1154/678 w-288.5 bg-linear-to-br to-[#9089FC]"
                style={{
                  clipPath:
                    'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
                }}
              />
            </div>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}
