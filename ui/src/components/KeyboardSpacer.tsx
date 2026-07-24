import { useEffect, useState } from 'react';

function getKeyboardHeight(): number {
  const vp = window.visualViewport;
  const height = vp?.height ?? window.innerHeight;
  return Math.max(0, window.innerHeight - (vp?.offsetTop ?? 0) - height);
}

export function KeyboardSpacer() {
  const [height, setHeight] = useState(getKeyboardHeight);

  useEffect(() => {
    const update = () => setHeight(getKeyboardHeight());
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

  return (
    <div
      className="w-full shrink-0"
      style={{ height }}
    />
  );
}
