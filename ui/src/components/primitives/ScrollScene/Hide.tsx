import { type ComponentPropsWithoutRef, type RefObject } from 'react';

import { motion } from 'framer-motion';

import { useHideOnScroll } from './hooks.ts';

type ScrollSceneHideProps = ComponentPropsWithoutRef<typeof motion.div> & {
  range: [number, number];
};

export function ScrollSceneHide({ range, className, style, children, ...props }: ScrollSceneHideProps) {
  const { ref, style: hideStyle } = useHideOnScroll(range);

  return (
    <motion.div
      ref={ref as RefObject<HTMLDivElement>}
      className={className}
      style={{ ...hideStyle, ...style }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
