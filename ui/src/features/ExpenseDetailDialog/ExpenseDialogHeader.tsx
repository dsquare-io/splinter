import { useContext, useState } from 'react';
import { OverlayTriggerStateContext } from 'react-aria-components';

import { EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import { BanknotesIcon, PencilSquareIcon, ReceiptPercentIcon, TrashIcon } from '@heroicons/react/24/outline';

import { ApiRoutes } from '@/api-types';
import { Expense } from '@/api-types/components/schemas';
import { urlWithArgs } from '@/api-types/url';
import { axiosInstance } from '@/axios';
import { emit } from '@/collections/events.ts';
import { DialogHeader, DropdownMenu, DropdownMenuItem, IconButton } from '@/components/primitives';
import { ExpenseEditorDialog } from '@/features/ExpenseEditorDialog';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { useConfirmation } from '@/hooks/useConfirmation';
import { invalidateQueriesForExpense } from '@/queryClient.ts';

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

export function ExpenseDialogHeader({ expenseUid }: { expenseUid: string }) {
  const { close } = useContext(OverlayTriggerStateContext)!;
  const { data: expense } = useApiQuery(ApiRoutes.EXPENSE_DETAIL, { expenseUid });
  const confirm = useConfirmation();
  const [isEditing, setIsEditing] = useState(false);

  const config = expense?.type === 'payment' ? PAYMENT_CONFIG : EXPENSE_CONFIG;
  const Icon = config.icon;
  const isExpense = expense?.type !== 'payment';

  async function handleDelete() {
    await confirm({
      title: isExpense ? 'Delete Expense' : 'Delete Payment',
      actionLabel: 'Delete',
      description: (
        <>
          Delete <span className="font-medium text-gray-800">{expense?.description}</span>?
        </>
      ),
      callback: async () => {
        await axiosInstance.delete(urlWithArgs(ApiRoutes.EXPENSE_DETAIL, { expenseUid }));
        await Promise.all([
          invalidateQueriesForExpense(expense),
          emit('expense:mutated', { uid: expenseUid, group: expense?.group }),
        ]);
        close();
      },
    });
  }

  return (
    <>
      <DialogHeader
        backButton
        prefix={
          <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
            <Icon className={`size-5 ${config.iconColor}`} />
          </div>
        }
        title={config.label}
        actions={
          <DropdownMenu
            trigger={
              <IconButton
                variant="plain"
                aria-label="More options"
              >
                <EllipsisVerticalIcon className="size-5" />
              </IconButton>
            }
          >
            {isExpense && (
              <DropdownMenuItem
                id="edit"
                icon={PencilSquareIcon}
                onAction={() => setIsEditing(true)}
              >
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              id="delete"
              icon={TrashIcon}
              variant="danger"
              onAction={handleDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenu>
        }
      />

      {isExpense && (
        <ExpenseEditorDialog
          isOpen={isEditing}
          expense={expense as Expense}
          onOpenChange={setIsEditing}
        />
      )}
    </>
  );
}
