import { type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react';

import { motion } from 'framer-motion';

import { useScrollAnimate } from './hooks.ts';
import { isAnimProp } from './utils.ts';

type ScrollSceneAnimateProps = {
  range: [number, number];
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
};

export function ScrollSceneAnimate({ range, className, style, children, ...rest }: ScrollSceneAnimateProps) {
  const animProps: Record<string, [number, number]> = {};
  const divProps: ComponentPropsWithoutRef<typeof motion.div> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (isAnimProp(value)) {
      animProps[key] = value;
    } else {
      divProps[key as keyof typeof divProps] = value;
    }
  }

  const animatedStyle = useScrollAnimate({ range, ...animProps });

  return (
    <motion.div
      className={className}
      style={{ ...animatedStyle, ...(style as object) } as CSSProperties}
      {...divProps}
    >
      {children}
    </motion.div>
  );
}
