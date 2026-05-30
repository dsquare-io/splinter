import { DocumentIcon } from '@heroicons/react/20/solid';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

import { ApiRoutes, PaymentTyped, SimpleGroup } from '@/api-types';
import type { MediaFile, MediaUrl } from '@/api-types/components/schemas';
import { urlWithArgs } from '@/api-types/url';
import { axiosInstance } from '@/axios';
import { Avatar, Money, UserLabel } from '@/components/primitives';
import { ThumbnailImage } from '@/components/ThumbnailImage';
import { GroupBadge } from './GroupBadge.tsx';

async function fetchMediaUrl(mediaUid: string): Promise<string> {
  const res = await axiosInstance.get<MediaUrl>(urlWithArgs(ApiRoutes.MEDIA_URL, { media_uid: mediaUid }));
  return res.data.url;
}

const fallbackIcon = (
  <div className="flex h-full w-full items-center justify-center">
    <DocumentIcon className="size-7 text-gray-400" />
  </div>
);

function PaymentAttachmentTile({ attachment }: { attachment: MediaFile }) {
  const open = async () => {
    const url = await fetchMediaUrl(attachment.uid);
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
        {attachment.thumbnailUrl ? (
          <ThumbnailImage
            src={attachment.thumbnailUrl}
            alt={attachment.originalFilename}
            className="h-full w-full object-cover"
            fallback={fallbackIcon}
          />
        ) : (
          fallbackIcon
        )}
        <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
      </div>
      <span className="w-16 truncate text-center text-xs text-gray-500">{attachment.originalFilename}</span>
    </button>
  );
}

export function PaymentDetail({ payment, group }: { payment: PaymentTyped; group?: SimpleGroup | null }) {
  return (
    <div className="my-6 flex flex-col items-center gap-y-4">
      <div className="flex items-center gap-x-8">
        <div className="flex flex-col items-center gap-y-2">
          <Avatar
            className="size-12"
            fallback={payment.sender.name}
          />
          <span className="text-sm text-gray-600">
            <UserLabel user={payment.sender} />
          </span>
        </div>

        <ArrowRightIcon
          className="size-5 text-gray-400"
          strokeWidth={1.5}
        />

        <div className="flex flex-col items-center gap-y-2">
          <Avatar
            className="size-12"
            fallback={payment.receiver.name}
          />
          <span className="text-sm text-gray-600">
            <UserLabel user={payment.receiver} />
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-0.5">
        <Money
          noTabularNums
          noColor
          className="text-2xl font-semibold text-gray-900"
          currency={payment.currency}
          value={payment.amount}
        />
        {payment.description && <p className="text-sm text-gray-500">{payment.description}</p>}
        <p className="text-xs text-gray-400">{format(new Date(payment.datetime), 'MMM d, yyyy')}</p>
        {group && (
          <div className="mt-2">
            <GroupBadge group={group} />
          </div>
        )}
      </div>

      {payment.attachments?.length > 0 && (
        <div className="w-full">
          <h3 className="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">Attachments</h3>
          <div className="flex flex-wrap gap-3">
            {payment.attachments.map((a) => (
              <PaymentAttachmentTile
                key={a.uid}
                attachment={a}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
