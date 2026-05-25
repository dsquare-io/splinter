import { createContext, useContext } from 'react';

import { type MotionValue } from 'framer-motion';

export type ScrollSceneContextValue = {
  scrollY: MotionValue<number>;
  headerHeight: MotionValue<number>; // frozen at scroll=0; drives Content paddingTop
  currentHeaderHeight: MotionValue<number>; // live animated height; drives CSS var for Sticky
};

export const ScrollSceneContext = createContext<ScrollSceneContextValue | null>(null);

export function useScrollSceneContext() {
  const ctx = useContext(ScrollSceneContext);
  if (!ctx) throw new Error('Must be used within ScrollScene');
  return ctx;
}

export function useScrollY(): MotionValue<number> {
  return useScrollSceneContext().scrollY;
}
