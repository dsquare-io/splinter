import { useState } from 'react';

import { Spinner } from '@/components/primitives/Spinner';

type Props = {
  src: string;
  fileName: string;
};

export function PdfPreview({ src, fileName }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-gray-500">
        <p>Cannot preview this PDF.</p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Open in new tab
        </a>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {!loaded && (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="size-8 text-gray-400" />
        </div>
      )}
      <iframe
        src={`${src}#toolbar=0`}
        title={fileName}
        className={loaded ? 'h-full w-full border-0' : 'hidden'}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
