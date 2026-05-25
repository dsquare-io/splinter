import { useRef, type ComponentPropsWithoutRef } from 'react';

import { useMotionValue, useMotionValueEvent, useScroll } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

import { ScrollSceneContext } from './context.ts';

export function ScrollSceneRoot({ className, children, ...props }: ComponentPropsWithoutRef<'div'>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headerHeight = useMotionValue(0);
  const currentHeaderHeight = useMotionValue(0);
  const { scrollY } = useScroll({ container: rootRef });

  useMotionValueEvent(currentHeaderHeight, 'change', (v) => {
    rootRef.current?.style.setProperty('--scroll-scene-header-height', `${v}px`);
  });

  return (
    <ScrollSceneContext.Provider value={{ scrollY, headerHeight, currentHeaderHeight }}>
      <div
        ref={rootRef}
        className={twMerge('overflow-auto', className)}
        {...props}
      >
        {children}
      </div>
    </ScrollSceneContext.Provider>
  );
}
