import { Dialog } from '@/components/primitives';
import { AddExpenseForm } from './AddExpenseForm.tsx';

type AddExpenseDialogProps = {
  onOpenChange?: (open: boolean) => void;
};

export function AddExpenseDialog({ onOpenChange }: AddExpenseDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <AddExpenseForm />
    </Dialog>
  );
}
