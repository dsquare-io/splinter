import { forwardRef, ReactNode } from 'react';
import { Modal, ModalOverlay, Dialog as RACDialog } from 'react-aria-components';

import { twMerge } from 'tailwind-merge';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { DialogContext } from './context';

const variantClasses = {
  modal: 'react-aria-Modal max-h-145 sm:max-w-lg',
  drawer: 'react-aria-Drawer',
};

type DialogProps = {
  children: ReactNode;
  isDismissable?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  dialogClassName?: string;
  variant?: keyof typeof variantClasses;
};

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  { children, isDismissable = true, isOpen, onOpenChange, className, dialogClassName, variant = 'modal' },
  ref
) {
  const content = (
    <RACDialog className={twMerge('react-aria-Dialog flex h-full flex-col', dialogClassName)}>
      {({ close }) => (
        <DialogContext.Provider value={{ close }}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </DialogContext.Provider>
      )}
    </RACDialog>
  );

  if (variant === 'drawer') {
    return (
      <Modal
        ref={ref}
        isDismissable={isDismissable}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className={twMerge(variantClasses[variant], className)}
      >
        {content}
      </Modal>
    );
  }

  return (
    <ModalOverlay
      isDismissable={isDismissable}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Modal
        ref={ref}
        className={twMerge(variantClasses[variant], className)}
      >
        {content}
      </Modal>
    </ModalOverlay>
  );
});
