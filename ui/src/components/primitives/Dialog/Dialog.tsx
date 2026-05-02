import { forwardRef, ReactNode } from 'react';
import { Modal, ModalOverlay, Dialog as RACDialog } from 'react-aria-components';

import { twMerge } from 'tailwind-merge';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight.ts';
import { DialogContext } from './context';

type DialogProps = {
  children: ReactNode;
  isDismissable?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  dialogClassName?: string;
  variant?: 'modal' | 'drawer';
};

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  { children, isDismissable = true, isOpen, onOpenChange, className, dialogClassName, variant = 'modal' },
  ref
) {
  const keyboardHeight = useKeyboardHeight();

  const content = (
    <RACDialog
      className={twMerge(
        'react-aria-Dialog flex max-h-[90vh] flex-col max-sm:overflow-y-auto',
        dialogClassName
      )}
    >
      {({ close }) => (
        <DialogContext.Provider value={{ close }}>
          <ErrorBoundary>{children}</ErrorBoundary>
          <div
            className="w-full shrink-0"
            style={{ height: keyboardHeight }}
          ></div>
        </DialogContext.Provider>
      )}
    </RACDialog>
  );

  if (variant === 'drawer') {
    return (
      <Modal
        ref={ref}
        isOpen={isOpen}
        isDismissable={isDismissable}
        onOpenChange={onOpenChange}
        className={twMerge('react-aria-Drawer', className)}
      >
        {content}
      </Modal>
    );
  }

  return (
    <ModalOverlay
      isOpen={isOpen}
      isDismissable={isDismissable}
      onOpenChange={onOpenChange}
    >
      <Modal
        ref={ref}
        className={twMerge('react-aria-Modal sm:max-w-lg', className)}
      >
        {content}
      </Modal>
    </ModalOverlay>
  );
});
