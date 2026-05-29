import { useEffect, useState } from 'react';

import { axiosInstance } from '@/axios';

interface Props {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function ThumbnailImage({ src, alt, className, fallback = null }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    axiosInstance
      .get(src, { responseType: 'blob' })
      .then((res) => {
        if (!cancelled) {
          objectUrl = URL.createObjectURL(res.data);
          setBlobUrl(objectUrl);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (error || (!blobUrl && !error)) return <>{fallback}</>;
  return <img src={blobUrl!} alt={alt} className={className} />;
}
