import { Dialog } from '@/components/primitives';
import { AddExpenseForm } from './AddExpenseForm.tsx';

type AddExpenseDialogProps = {
  onOpenChange?: (open: boolean) => void;
};

export function AddExpenseDialog({ onOpenChange }: AddExpenseDialogProps) {
  return (
    <Dialog
      onOpenChange={onOpenChange}
      className="flex max-h-none min-h-105 flex-col overflow-auto"
      dialogClassName="grow"
    >
      <AddExpenseForm />
    </Dialog>
  );
}
