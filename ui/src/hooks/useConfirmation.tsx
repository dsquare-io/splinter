import React, {ReactElement, createContext, useCallback, useContext, useRef, useState} from 'react';
import {Dialog, Modal} from 'react-aria-components';

import {ExclamationTriangleIcon} from '@heroicons/react/24/outline';

import {AlertActions, AlertContent, AlertDescription, AlertHeading, AlertIcon} from '@/components/Alert.tsx';
import {Button} from '@/components/common';

interface Options {
  callback?: () => Promise<any> | void;
  description?: React.ReactNode;
  actionLabel?: string;
  variant?: string;
  Icon?: ReactElement;
  title: string;
}

const ConfirmationServiceContext = createContext<(options: Options) => Promise<boolean>>(Promise.reject);

export const useConfirmation = () => useContext(ConfirmationServiceContext);

export function ConfirmationProvider({children}: React.PropsWithChildren<any>) {
  const [options, setOptions] = useState<Options>({} as any);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const awaitingPromiseRef = useRef<{resolve: (value: boolean) => void}>();

  const openConfirmation = useCallback(
    (opt: Options) => {
      setOptions(opt);
      setShow(true);
      return new Promise<boolean>((resolve) => {
        awaitingPromiseRef.current = {resolve};
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

      {/*<ModalOverlay isDismissable>*/}
      <Modal
        isOpen={show}
        onOpenChange={(open) => !open && handleCancel()}
        className="react-aria-Modal max-h-[580px] overflow-y-auto sm:max-w-lg"
      >
        <Dialog className="react-aria-Dialog flex h-full flex-col">
          <AlertContent>
            <AlertIcon>{options?.Icon ?? <ExclamationTriangleIcon />}</AlertIcon>
            {options?.title && <AlertHeading>{options?.title}</AlertHeading>}
            {options?.description && <AlertDescription>{options?.description}</AlertDescription>}
          </AlertContent>
          <AlertActions>
            <Button
              variant="outline"
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
          </AlertActions>
        </Dialog>
      </Modal>
      {/*</ModalOverlay>*/}
    </>
  );
}
