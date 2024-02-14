import ExpenseItems from '@components/AddExpense/ExpenseItems.tsx';
import {useContext} from 'react';
import {Dialog, Heading, Modal, ModalOverlay, OverlayTriggerStateContext} from 'react-aria-components';

import ExpenseParticipantsSelector from '@components/AddExpense/ExpenseParticipantsSelector.tsx';
import {Button} from '@components/common';
import {ChevronRightIcon, XMarkIcon} from '@heroicons/react/24/outline';
import {ChevronLeftIcon} from '@heroicons/react/24/solid';

function CloseButton() {
  const state = useContext(OverlayTriggerStateContext)!;

  return (
    <button
      onClick={() => state.close()}
      className="focus:ring-ring absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
    >
      <XMarkIcon className="size-5" />
    </button>
  );
}

export function AddExpense() {
  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal h-[--visual-viewport-height] max-h-[580px] sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex flex-col h-full">
          <div className="mb-4">
            <Heading slot="title">Add Expense</Heading>
            <CloseButton />
          </div>

          <ExpenseParticipantsSelector />
          <ExpenseItems />

          <div className="-mx-4 flex justify-between border-t border-neutral-300 px-4 pt-4 sm:-mx-6 sm:px-6">
            <Button variant="outline">
              <ChevronLeftIcon className="size-4" />
              Back
            </Button>

            <Button>
              Next
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
