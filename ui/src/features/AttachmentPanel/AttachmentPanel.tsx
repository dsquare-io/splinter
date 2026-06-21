import { useRef } from 'react';

import { PaperClipIcon } from '@heroicons/react/20/solid';
import { AnimatePresence } from 'framer-motion';

import { FieldError } from '@/components/form';
import { AttachmentTile } from './AttachmentTile.tsx';
import { useAttachmentContext } from './Context.tsx';
import { useAttachmentConfig } from './useAttachmentConfig';

export function AttachmentPanel() {
  const {
    pendingAttachments,
    existingAttachments,
    addFiles,
    removePending,
    removeExisting,
    clearValidationError,
  } = useAttachmentContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasItems = existingAttachments.length > 0 || pendingAttachments.length > 0;

  const { allowedExtensions } = useAttachmentConfig();

  return (
    <div className="space-y-2">
      {hasItems && (
        <div className="flex gap-3 overflow-x-auto pt-1.5 pb-1">
          <AnimatePresence>
            {existingAttachments.map((a) => (
              <AttachmentTile
                key={a.uid}
                status="existing"
                label={a.fileName}
                onRemove={() => removeExisting(a.uid)}
                thumbnailUrl={a.thumbnailUrl}
              />
            ))}

            {pendingAttachments.map((a) => {
              const isImage = a.contentType.startsWith('image/');
              return (
                <AttachmentTile
                  key={a.localId}
                  status={a.status}
                  label={a.filename}
                  progress={a.progress}
                  onRemove={() => removePending(a.localId)}
                  thumbnailUrl={isImage ? a.previewUrl : null}
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
        accept={(allowedExtensions ?? []).join(',')}
        multiple
        capture="environment"
        onChange={(e) => {
          if (e.target.files?.length) {
            addFiles(e.target.files);
            e.target.value = '';
          }
        }}
      />

      <button
        type="button"
        onClick={() => {
          clearValidationError();
          inputRef.current?.click();
        }}
        className="flex items-center gap-x-1.5 text-sm text-neutral-500 hover:text-neutral-700"
      >
        <PaperClipIcon className="size-4" />
        Add attachment
      </button>

      <FieldError />
    </div>
  );
}
