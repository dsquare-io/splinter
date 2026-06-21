import { useState } from 'react';

import { DocumentIcon } from '@heroicons/react/20/solid';

import type { FileAttachment } from '@/api-types/components/schemas';
import { Thumbnail } from '@/features/AttachmentPanel';
import { AttachmentPreviewDialog } from '@/features/AttachmentPreviewDialog';

type Props = {
  attachments: FileAttachment[];
};

export function ExpenseAttachment({ attachments }: Props) {
  const [selected, setSelected] = useState<FileAttachment | null>(null);

  if (!attachments.length) return null;

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-3">
        {attachments.map((a) => (
          <button
            type="button"
            key={a.uid}
            onClick={() => setSelected(a)}
            className="group relative flex flex-col items-center gap-1"
            title={a.fileName}
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition group-hover:border-gray-300">
              {a.contentType.startsWith('image/') ? (
                <Thumbnail
                  src={a.thumbnailUrl}
                  alt={a.fileName}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <DocumentIcon className="size-7 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
            </div>
            <span className="w-16 truncate text-center text-xs text-gray-500">{a.fileName}</span>
          </button>
        ))}
      </div>
      <AttachmentPreviewDialog
        attachment={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
