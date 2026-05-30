import { CSSProperties, forwardRef, ReactNode } from 'react';
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
  mobileFullscreen?: boolean;
};

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    children,
    isDismissable = true,
    isOpen,
    onOpenChange,
    className,
    dialogClassName,
    variant = 'modal',
    mobileFullscreen = false,
  },
  ref
) {
  const keyboardHeight = useKeyboardHeight();
  const keyboardStyle = { '--keyboard-height': `${keyboardHeight}px` } as CSSProperties;

  const content = (
    <RACDialog
      className={twMerge(
        'react-aria-Dialog flex flex-col',
        mobileFullscreen && 'react-aria-Dialog--fullscreen',
        dialogClassName
      )}
    >
      {({ close }) => (
        <DialogContext.Provider value={{ close }}>
          <ErrorBoundary>{children}</ErrorBoundary>
          {!mobileFullscreen && (
            <div
              className="w-full shrink-0"
              style={{ height: keyboardHeight }}
            ></div>
          )}
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
        style={keyboardStyle}
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
      className={twMerge(
        'react-aria-ModalOverlay',
        mobileFullscreen && 'react-aria-ModalOverlay--fullscreen'
      )}
    >
      <Modal
        ref={ref}
        className={twMerge(
          'react-aria-Modal sm:max-w-lg',
          mobileFullscreen && 'react-aria-Modal--fullscreen',
          className
        )}
        style={keyboardStyle}
      >
        {content}
      </Modal>
    </ModalOverlay>
  );
});
