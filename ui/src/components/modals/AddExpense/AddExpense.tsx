import {useState} from 'react';
import {Dialog, Heading, Modal, ModalOverlay} from 'react-aria-components';

import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/react/20/solid';

import {Button, Form} from '@/components/common';
import {CloseDialog} from '@/components/modals/utils';

import ExpenseItems from './ExpenseInputList';
import ExpensesShares from './ExpensesShares';
import ParticipantsSelector from './ParticipantsSelector';
import {SingleExpenseShares} from './SingleExpenseShares';

export default function AddExpense() {
  const [step, setStep] = useState(0);

  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal flex min-h-[420px] flex-col sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full grow flex-col">
          <div className="mb-6">
            <Heading slot="title">Add Expense</Heading>
            <CloseDialog />
          </div>
          <Form className="flex grow flex-col">
            {step === 0 && (
              <div className="grow">
                <ParticipantsSelector />
                <ExpenseItems />
              </div>
            )}

            {step === 1 && <ExpensesShares />}

            {step === 2 && (
              <div className="grow">
                <SingleExpenseShares />
              </div>
            )}

            <div className="-mx-4 mt-4 flex justify-between px-4 pt-2 sm:-mx-6 sm:px-6">
              <Button
                slot={null}
                variant="outline"
                onPress={() => setStep((s) => Math.max(0, s - 1))}
              >
                <ChevronLeftIcon className="size-4" />
                Back
              </Button>

              <Button
                slot={null}
                onPress={() => setStep((s) => Math.min(2, s + 1))}
              >
                Next
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>
          </Form>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
