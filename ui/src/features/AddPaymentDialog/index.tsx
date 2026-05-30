import type { ComponentProps } from 'react';

import { Dialog, DialogHeader } from '@/components/primitives';
import { AddPaymentForm } from './AddPaymentForm';

type AddPaymentModalProps = ComponentProps<typeof AddPaymentForm> & {
  onOpenChange?: (open: boolean) => void;
};

export function AddPaymentDialog({ onOpenChange, ...props }: AddPaymentModalProps) {
  return (
    <Dialog
      mobileFullscreen
      onOpenChange={onOpenChange}
    >
      <DialogHeader
        title="Settle Up"
        description="Record a payment to clear an outstanding balance."
      />
      <AddPaymentForm {...props} />
    </Dialog>
  );
}
