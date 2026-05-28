import { useRef } from 'react';

import { DocumentIcon, PaperClipIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';

import type { MediaFile } from '@/api-types/components/schemas.d.ts';
import type { PendingAttachment } from './useAttachments.ts';
import { ACCEPTED_TYPES } from './useAttachments.ts';

interface Props {
  pendingAttachments: PendingAttachment[];
  existingAttachments: MediaFile[];
  onAddFiles: (files: FileList) => void;
  onRemovePending: (localId: string) => void;
  onRemoveExisting: (uid: string) => void;
  validationError: string | null;
  onClearError: () => void;
}

function ProgressRing({ progress }: { progress: number }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;

  return (
    <svg
      className="absolute inset-0 -rotate-90"
      width="40"
      height="40"
      viewBox="0 0 40 40"
    >
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="3"
      />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function AttachmentChip({
  thumbnail,
  label,
  progress,
  status,
  onRemove,
}: {
  thumbnail: React.ReactNode;
  label: string;
  progress?: number;
  status: PendingAttachment['status'] | 'existing';
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.15 }}
      className="relative flex-shrink-0"
    >
      <div className="relative h-14 w-14 rounded-lg border border-gray-200 bg-gray-100">
        {thumbnail}
        {status === 'uploading' && progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <ProgressRing progress={progress} />
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/60">
            <ExclamationCircleIcon className="size-5 text-white" />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-800"
        aria-label={`Remove ${label}`}
      >
        <XMarkIcon className="size-3" />
      </button>
      <p className="mt-0.5 w-14 truncate text-center text-xs text-gray-500">{label}</p>
    </motion.div>
  );
}

export function AttachmentStrip({
  pendingAttachments,
  existingAttachments,
  onAddFiles,
  onRemovePending,
  onRemoveExisting,
  validationError,
  onClearError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasItems = existingAttachments.length > 0 || pendingAttachments.length > 0;

  const accept = ACCEPTED_TYPES.filter((t) => t !== 'image/heic' && t !== 'image/heif').join(',') + ',.heic,.heif';

  return (
    <div className="space-y-2">
      {hasItems && (
        <div className="flex gap-3 overflow-x-auto pt-1.5 pb-1">
          <AnimatePresence>
            {existingAttachments.map((a) => {
              const isImage = a.contentType?.startsWith('image/') ?? false;
              return (
                <AttachmentChip
                  key={a.uid}
                  status="existing"
                  label={a.originalFilename}
                  onRemove={() => onRemoveExisting(a.uid)}
                  thumbnail={
                    isImage && a.signedUrl ? (
                      <img
                        src={a.signedUrl}
                        alt={a.originalFilename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <DocumentIcon className="size-6 text-gray-400" />
                      </div>
                    )
                  }
                />
              );
            })}

            {pendingAttachments.map((a) => {
              const isImage = a.contentType.startsWith('image/');
              return (
                <AttachmentChip
                  key={a.localId}
                  status={a.status}
                  label={a.filename}
                  progress={a.progress}
                  onRemove={() => onRemovePending(a.localId)}
                  thumbnail={
                    isImage && a.previewUrl ? (
                      <img
                        src={a.previewUrl}
                        alt={a.filename}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <DocumentIcon className="size-6 text-gray-400" />
                      </div>
                    )
                  }
                />
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        multiple
        capture="environment"
        onChange={(e) => {
          if (e.target.files?.length) {
            onAddFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      <button
        type="button"
        onClick={() => {
          onClearError();
          inputRef.current?.click();
        }}
        className="flex items-center gap-x-1.5 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <PaperClipIcon className="size-4" />
        Add attachment
      </button>

      {validationError && <p className="text-xs text-red-600">{validationError}</p>}
    </div>
  );
}
