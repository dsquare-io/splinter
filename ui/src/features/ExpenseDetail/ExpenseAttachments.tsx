import { DocumentIcon } from '@heroicons/react/20/solid';

import type { FileAttachment } from '@/api-types/components/schemas';
import { ThumbnailImage } from '@/components/ThumbnailImage';

interface Props {
  attachments: FileAttachment[];
}

const fallbackIcon = (
  <div className="flex h-full w-full items-center justify-center">
    <DocumentIcon className="size-7 text-gray-400" />
  </div>
);

function AttachmentTile({ attachment }: { attachment: FileAttachment }) {
  const open = () => {
    window.open(attachment.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={open}
      className="group relative flex flex-col items-center gap-1"
      title={attachment.fileName}
    >
      <div className="relative h-16 w-16 rounded-lg border border-gray-200 bg-gray-100 transition group-hover:border-gray-300">
        {attachment.thumbnailUrl ? (
          <ThumbnailImage
            src={attachment.thumbnailUrl}
            alt={attachment.fileName}
            className="h-full w-full object-cover"
            fallback={fallbackIcon}
          />
        ) : (
          fallbackIcon
        )}
        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      </div>
      <span className="w-16 truncate text-center text-xs text-gray-500">{attachment.fileName}</span>
    </button>
  );
}

export function ExpenseAttachments({ attachments }: Props) {
  if (!attachments.length) return null;

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">Attachments</h3>
      <div className="flex flex-wrap gap-3">
        {attachments.map((a) => (
          <AttachmentTile
            key={a.uid}
            attachment={a}
          />
        ))}
      </div>
    </div>
  );
}
