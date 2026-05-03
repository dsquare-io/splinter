import { useState } from 'react';

import { ArrowUturnLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/16/solid';

import { ApiRoutes, urlWithArgs } from '@/api-types';
import { axiosInstance } from '@/axios.ts';
import { Button } from '@/components/primitives';
import { invalidateQueriesForExpense } from '@/queryClient.ts';

type DeletedBannerProps = {
  type: 'expense' | 'payment';
  uid: string;
  group: string | null;
};

export function DeletedBanner({ type, uid, group }: DeletedBannerProps) {
  const [restoring, setRestoring] = useState(false);

  async function handleRestore() {
    setRestoring(true);
    try {
      await axiosInstance.patch(urlWithArgs(ApiRoutes.EXPENSE_DETAIL, { expense_uid: uid }));
      await invalidateQueriesForExpense({ uid, group });
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="flex items-center gap-x-2 bg-amber-50 px-4 py-2 text-sm text-amber-700 sm:px-6 md:px-8">
      <ExclamationTriangleIcon className="size-4 shrink-0 text-amber-500" />
      <span className="flex-1">This {type} has been deleted.</span>
      <Button
        variant="plain"
        aria-label="Undo delete"
        onPress={handleRestore}
        isPending={restoring}
        color="warn"
      >
        <ArrowUturnLeftIcon className="size-4" />
        Undo
      </Button>
    </div>
  );
}
