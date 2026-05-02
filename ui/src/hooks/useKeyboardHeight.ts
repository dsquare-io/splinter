import { useEffect, useState } from 'react';

function getViewportState(): number {
  const vp = window.visualViewport;
  const height = vp?.height ?? window.innerHeight;
  return Math.max(0, window.innerHeight - (vp?.offsetTop ?? 0) - height);
}

export function useKeyboardHeight(): number {
  const [state, setState] = useState(getViewportState);

  useEffect(() => {
    const update = () => setState(getViewportState());

    const vp = window.visualViewport;
    if (vp) {
      vp.addEventListener('resize', update);
      vp.addEventListener('scroll', update);
      return () => {
        vp.removeEventListener('resize', update);
        vp.removeEventListener('scroll', update);
      };
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return state;
}
