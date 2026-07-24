import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

import type { FileAttachment } from '@/api-types/components/schemas';
import { IconButton } from '@/components/primitives/Button';
import { Dialog, DialogHeader } from '@/components/primitives/Dialog';
import { ImagePreview } from './ImagePreview';
import { PdfPreview } from './PdfPreview';

type Props = {
  attachment: FileAttachment | null;
  onClose: () => void;
};

export function AttachmentPreviewDialog({ attachment, onClose }: Props) {
  return (
    <Dialog
      isOpen={attachment !== null}
      isDismissable
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      className="sm:max-w-3xl"
      dialogClassName="sm:h-[90dvh]"
    >
      {attachment && (
        <>
          <DialogHeader
            title={attachment.fileName}
            actions={
              <IconButton
                variant="plain"
                aria-label="Open in new tab"
                onPress={() => window.open(attachment.url, '_blank', 'noopener,noreferrer')}
              >
                <ArrowTopRightOnSquareIcon className="size-5" />
              </IconButton>
            }
          />
          <div className="-mx-4 -mb-4 flex min-h-0 flex-1 flex-col sm:-mx-6 sm:-mb-6">
            {attachment.contentType.startsWith('image/') ? (
              <ImagePreview
                src={attachment.url}
                alt={attachment.fileName}
              />
            ) : (
              <PdfPreview
                src={attachment.url}
                fileName={attachment.fileName}
              />
            )}
          </div>
        </>
      )}
    </Dialog>
  );
}
