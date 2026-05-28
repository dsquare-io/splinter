import { DocumentIcon } from '@heroicons/react/20/solid';

import { ApiRoutes } from '@/api-types';
import type { AttachmentSignedUrl, MediaFile } from '@/api-types/components/schemas';
import { urlWithArgs } from '@/api-types/url';
import { axiosInstance } from '@/axios';

interface Props {
  expenseId: string;
  attachments: MediaFile[];
}

async function fetchSignedUrl(expenseId: string, attachmentUid: string): Promise<string> {
  const res = await axiosInstance.get<AttachmentSignedUrl>(
    urlWithArgs(ApiRoutes.EXPENSE_ATTACHMENT_URL, { expense_uid: expenseId, attachment_uid: attachmentUid }),
  );
  return res.data.url;
}

function AttachmentTile({ expenseId, attachment }: { expenseId: string; attachment: MediaFile }) {
  const isImage = attachment.contentType?.startsWith('image/') ?? false;

  const open = async () => {
    const url = await fetchSignedUrl(expenseId, attachment.uid);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={open}
      className="group relative flex flex-col items-center gap-1"
      title={attachment.originalFilename}
    >
      <div className="relative h-16 w-16 rounded-lg border border-gray-200 bg-gray-100 transition group-hover:border-gray-300">
        {isImage && attachment.signedUrl ? (
          <img
            src={attachment.signedUrl}
            alt={attachment.originalFilename}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <DocumentIcon className="size-7 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      </div>
      <span className="w-16 truncate text-center text-xs text-gray-500">{attachment.originalFilename}</span>
    </button>
  );
}

export function ExpenseAttachments({ expenseId, attachments }: Props) {
  if (!attachments.length) return null;

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Attachments</h3>
      <div className="flex flex-wrap gap-3">
        {attachments.map((a) => (
          <AttachmentTile
            key={a.uid}
            expenseId={expenseId}
            attachment={a}
          />
        ))}
      </div>
    </div>
  );
}
