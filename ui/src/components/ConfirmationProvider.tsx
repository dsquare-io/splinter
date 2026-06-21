import clsx from 'clsx';
import { useCallback, useRef, useState, type PropsWithChildren } from 'react';
import { Heading } from 'react-aria-components';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import { Button, Dialog } from '@/components/primitives';
import { ConfirmationOptions, ConfirmationServiceContext } from '@/hooks/useConfirmation';

export function ConfirmationProvider({ children }: PropsWithChildren<any>) {
  const [options, setOptions] = useState<ConfirmationOptions>({} as any);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const awaitingPromiseRef = useRef<{ resolve: (value: boolean) => void }>();

  const openConfirmation = useCallback(
    (opt: ConfirmationOptions) => {
      setOptions(opt);
      setShow(true);
      return new Promise<boolean>((resolve) => {
        awaitingPromiseRef.current = { resolve };
      });
    },
    [setOptions, setShow]
  );

  const handleCancel = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve(false);
    }

    setShow(false);
  };

  const handleConfirm = () => {
    if (awaitingPromiseRef.current) {
      if (options && options.callback) {
        const r = options.callback();
        if (Promise.resolve(r) === r) {
          setLoading(true);
          r.then(() => {
            awaitingPromiseRef.current?.resolve(true);
          }).finally(() => {
            setLoading(false);
            setShow(false);
          });
        } else {
          awaitingPromiseRef.current.resolve(true);
          setShow(false);
        }
      } else {
        awaitingPromiseRef.current.resolve(true);
        setShow(false);
      }
    }
  };

  return (
    <>
      <ConfirmationServiceContext.Provider value={openConfirmation}>
        {children}
      </ConfirmationServiceContext.Provider>

      <Dialog
        isOpen={show}
        onOpenChange={(open) => !open && handleCancel()}
        variant="prompt"
        isDismissable
      >
        <div className="grid-flow-row grid-cols-[auto_1fr] [grid-template-areas:'icon_title'_'icon_description'] sm:grid">
          <div
            className={clsx(
              'mx-auto flex size-12 shrink-0 items-center justify-center rounded-full [grid-area:icon] **:data-[slot="icon"]:size-6 sm:mx-0 sm:h-10 sm:w-10',
              'bg-red-100 **:data-[slot="icon"]:text-red-600'
            )}
          >
            {options?.Icon ?? <ExclamationTriangleIcon />}
          </div>
          {options?.title && (
            <Heading
              slot="title"
              className="mt-3 text-base leading-6 font-semibold text-gray-900 [grid-area:title] sm:mt-0 sm:ml-3"
            >
              {options.title}
            </Heading>
          )}
          {options?.description && (
            <p className="mt-2 text-sm text-gray-500 [grid-area:description] sm:ml-3">
              {options.description}
            </p>
          )}
        </div>
        <div className="mt-5 flex flex-col-reverse gap-4 sm:mt-4 sm:flex-row sm:justify-end">
          <Button
            variant="outlined"
            isDisabled={loading}
            onPress={handleCancel}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            isDisabled={loading}
            onPress={handleConfirm}
          >
            {options?.actionLabel ?? 'Confirm Delete'}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
