import { type ComponentPropsWithoutRef } from 'react';

import { motion } from 'framer-motion';

import { useScrollSceneContext } from './context.ts';

export function ScrollSceneContent({
  className,
  style,
  children,
  ...props
}: ComponentPropsWithoutRef<typeof motion.div>) {
  const { headerHeight } = useScrollSceneContext();

  return (
    <motion.div
      className={className}
      style={{ paddingTop: headerHeight, ...style }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
