import { useEffect, useRef, useState, type SyntheticEvent } from 'react';

import {
  ArrowsPointingOutIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';

import { Spinner } from '@/components/primitives';
import { IconButton } from '@/components/primitives/Button';
import { DialogFooter } from '@/components/primitives/Dialog';

const MIN_SCALE = 0.1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;

type Props = { src: string; alt: string };

export function ImagePreview({ src, alt }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(1);
  const [fitScale, setFitScale] = useState(1);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [prevSrc, setPrevSrc] = useState(src);
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(scale);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setLoaded(false);
    setError(false);
    setNaturalSize(null);
    setScale(1);
    setFitScale(1);
  }

  // Scroll to center when scale changes via buttons
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [scale]);

  // Pinch-to-zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let startDist = 0;
    let startScale = 1;

    const pinchDist = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      startDist = pinchDist(e.touches);
      startScale = scaleRef.current;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const ratio = pinchDist(e.touches) / startDist;
      setScale(Math.round(Math.max(MIN_SCALE, Math.min(MAX_SCALE, startScale * ratio)) * 100) / 100);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const clamp = (s: number) => Math.round(Math.max(MIN_SCALE, Math.min(MAX_SCALE, s)) * 100) / 100;
  const zoomIn = () => setScale((s) => clamp(s + SCALE_STEP));
  const zoomOut = () => setScale((s) => clamp(s - SCALE_STEP));
  const fitToWindow = () => setScale(fitScale);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;
    const { clientWidth: cw, clientHeight: ch } = container;
    const { naturalWidth: nw, naturalHeight: nh } = img;
    const pad = 32; // p-4 × 2 sides
    const fit = Math.min((cw - pad) / nw, (ch - pad) / nh, MAX_SCALE);
    setNaturalSize({ w: nw, h: nh });
    setFitScale(fit);
    setScale(fit);
    setLoaded(true);
  };

  if (error) {
    return (
      <div className="flex h-[65vh] items-center justify-center text-sm text-gray-500">
        Failed to load image.
      </div>
    );
  }

  // CSS grid (1fr auto) so DialogFooter's internal grow spacer doesn't compete
  // with the image scroll area for height
  return (
    <div
      className="min-h-0 flex-1"
      style={{ display: 'grid', gridTemplateRows: '1fr auto', minHeight: 0 }}
    >
      {/* -mx extends image area to dialog edges, overriding dialog padding */}
      <div
        ref={containerRef}
        className="relative -mx-4 overflow-auto bg-gray-50 sm:-mx-6"
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="size-8 text-gray-400" />
          </div>
        )}
        <div className="flex min-h-full min-w-full items-center justify-center p-4">
          <img
            src={src}
            alt={alt}
            draggable={false}
            className={loaded && naturalSize ? 'block max-w-none select-none' : 'hidden'}
            style={naturalSize ? { width: naturalSize.w * scale, height: naturalSize.h * scale } : {}}
            onLoad={handleLoad}
            onError={() => setError(true)}
          />
        </div>
      </div>

      <DialogFooter>
        <div className="flex items-center justify-center gap-1 py-1">
          <IconButton
            variant="plain"
            aria-label="Zoom out"
            onPress={zoomOut}
            isDisabled={scale <= MIN_SCALE}
          >
            <MagnifyingGlassMinusIcon className="size-4" />
          </IconButton>
          <span className="w-12 text-center text-sm text-gray-500 tabular-nums select-none">
            {Math.round(scale * 100)}%
          </span>
          <IconButton
            variant="plain"
            aria-label="Zoom in"
            onPress={zoomIn}
            isDisabled={scale >= MAX_SCALE}
          >
            <MagnifyingGlassPlusIcon className="size-4" />
          </IconButton>
          <div className="mx-1 h-4 w-px bg-gray-200" />
          <IconButton
            variant="plain"
            aria-label="Fit to window"
            onPress={fitToWindow}
            isDisabled={scale === fitScale}
          >
            <ArrowsPointingOutIcon className="size-4" />
          </IconButton>
        </div>
      </DialogFooter>
    </div>
  );
}
