import { ScrollSceneAnimate } from './Animate.tsx';
import { ScrollSceneContent } from './Content.tsx';
import { ScrollSceneHeader } from './Header.tsx';
import { ScrollSceneHide } from './Hide.tsx';
import { ScrollSceneRoot } from './Root.tsx';
import { ScrollSceneSticky } from './Sticky.tsx';

export { useScrollY } from './context.ts';
export { useScrollAnimate, useHideOnScroll } from './hooks.ts';

export const ScrollScene = Object.assign(ScrollSceneRoot, {
  Header: ScrollSceneHeader,
  Content: ScrollSceneContent,
  Sticky: ScrollSceneSticky,
  Animate: ScrollSceneAnimate,
  Hide: ScrollSceneHide,
});
