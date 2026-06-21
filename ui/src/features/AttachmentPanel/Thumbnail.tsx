import { useState } from 'react';

import { PhotoIcon } from '@heroicons/react/24/outline';

type Props = {
  src: string | null;
  alt: string;
};

export function Thumbnail({ src, alt }: Props) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <PhotoIcon className="size-7 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setError(true)}
    />
  );
}
