import { forwardRef, ReactNode } from 'react';
import { Modal, ModalOverlay, Dialog as RACDialog } from 'react-aria-components';

import { twMerge } from 'tailwind-merge';
import { tv, VariantProps } from 'tailwind-variants';

import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight.ts';
import { DialogContext } from './context';

const dialogStyle = tv({
  base: 'relative flex flex-col overflow-y-auto p-4 focus:outline-hidden sm:p-6',
  variants: {
    variant: {
      modal: 'max-sm:h-dvh sm:max-h-[90vh]',
      drawer: 'max-h-screen',
      prompt: '',
    },
  },
  defaultVariants: {
    variant: 'modal',
  },
});

type DialogProps = VariantProps<typeof dialogStyle> & {
  children: ReactNode;
  isDismissable?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  { children, isDismissable = false, isOpen, onOpenChange, className, variant = 'modal' },
  ref
) {
  const keyboardHeight = useKeyboardHeight();

  const content = (
    <RACDialog className={dialogStyle({ variant })}>
      {({ close }) => (
        <DialogContext.Provider value={{ close }}>
          <ErrorBoundary>{children}</ErrorBoundary>
          <div
            className="w-full shrink-0"
            style={{ height: keyboardHeight }}
          />
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
        className={twMerge(
          'react-aria-Drawer fixed right-0 h-dvh w-full max-w-lg bg-white text-left shadow-xl',
          className
        )}
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
        className={twMerge(
          'react-aria-Modal relative w-full overflow-hidden bg-white text-left shadow-xl sm:my-8 sm:max-h-[90dvh] sm:max-w-lg sm:rounded-lg',
          className
        )}
      >
        {content}
      </Modal>
    </ModalOverlay>
  );
});
