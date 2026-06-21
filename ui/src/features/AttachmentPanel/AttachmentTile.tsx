import { DocumentIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import { ProgressRing } from './ProgressRing.tsx';
import { Thumbnail } from './Thumbnail.tsx';
import type { LocalAttachment } from './useAttachment.ts';

export function AttachmentTile({
  label,
  progress,
  status,
  thumbnailUrl,
  onRemove,
}: {
  label: string;
  progress?: number;
  status: LocalAttachment['status'] | 'existing';
  thumbnailUrl?: string | null;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.15 }}
      className="relative shrink-0"
    >
      <div
        className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
        title={label}
      >
        {thumbnailUrl ? (
          <Thumbnail
            src={thumbnailUrl}
            alt={label}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <DocumentIcon className="size-6 text-gray-400" />
          </div>
        )}
        {status === 'uploading' && progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <ProgressRing progress={progress} />
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/60">
            <ExclamationCircleIcon className="size-6 text-white" />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-800"
        disabled={status === 'uploading'}
        aria-label={`Remove ${label}`}
      >
        <XMarkIcon className="size-3" />
      </button>
      <p className="mt-0.5 w-14 truncate text-center text-xs text-gray-500">{label}</p>
    </motion.div>
  );
}
