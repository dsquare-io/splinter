import { useContext } from 'react';
import { Heading, OverlayTriggerStateContext } from 'react-aria-components';

import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { BanknotesIcon, ReceiptPercentIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { ApiRoutes } from '@/api-types';
import { IconButton } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

const EXPENSE_CONFIG = {
  icon: ReceiptPercentIcon,
  iconBg: 'bg-indigo-100',
  iconColor: 'text-indigo-600',
  label: 'Expense',
} as const;

const PAYMENT_CONFIG = {
  icon: BanknotesIcon,
  iconBg: 'bg-green-100',
  iconColor: 'text-green-600',
  label: 'Payment',
} as const;

export function ExpenseDialogHeader({ expenseId }: { expenseId: string }) {
  const { close } = useContext(OverlayTriggerStateContext)!;
  const { data: expense } = useApiQuery(ApiRoutes.EXPENSE_DETAIL, { expense_uid: expenseId });

  const config = expense?.type === 'payment' ? PAYMENT_CONFIG : EXPENSE_CONFIG;
  const Icon = config.icon;

  return (
    <div className="mb-6 flex items-center gap-x-4">
      <IconButton
        variant="plain"
        aria-label="Go back"
        onPress={close}
        className="-ml-1 sm:hidden"
      >
        <ChevronLeftIcon className="size-5" />
      </IconButton>

      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
        <Icon className={`size-5 ${config.iconColor}`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs tracking-wide text-gray-400">{config.label}</p>
        <Heading
          slot="title"
          className="truncate text-base font-semibold text-gray-900"
        >
          {expense?.description ?? ''}
        </Heading>
      </div>

      <IconButton
        variant="plain"
        aria-label="Close"
        onPress={close}
        className="max-sm:hidden"
      >
        <XMarkIcon className="size-5" />
      </IconButton>
    </div>
  );
}
