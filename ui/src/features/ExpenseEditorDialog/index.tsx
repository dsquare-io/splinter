import type { Expense } from '@/api-types/components/schemas';
import { Dialog } from '@/components/primitives';
import { ExpenseEditorForm } from './ExpenseEditorForm.tsx';

type ExpenseEditorDialogProps = {
  expense?: Expense;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ExpenseEditorDialog({ expense, isOpen, onOpenChange }: ExpenseEditorDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ExpenseEditorForm expense={expense} />
    </Dialog>
  );
}
