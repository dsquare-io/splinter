import { Dialog } from '@/components/primitives';
import { AddExpenseContent } from './AddExpenseContent.tsx';

export function AddExpenseDialog({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  return (
    <Dialog
      onOpenChange={onOpenChange}
      className="flex max-h-none min-h-105 flex-col overflow-auto"
      dialogClassName="grow"
    >
      <AddExpenseContent />
    </Dialog>
  );
}
