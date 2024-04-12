import {useState} from 'react';
import {Dialog, Heading, Modal, ModalOverlay} from 'react-aria-components';
import {useForm} from 'react-hook-form';

import {CheckIcon, ChevronLeftIcon} from '@heroicons/react/20/solid';

import {Paths} from '@/api-types/routePaths.ts';
import {Button, FieldScope, Form, HiddenField} from '@/components/common';
import {CloseDialog} from '@/components/modals/utils';

import ExpenseEntry from './ExpenseEntry.tsx';
import {SingleExpenseShares} from './SingleExpenseShares';


export default function AddExpense() {
  const [currentStep, setCurrentStep] = useState('entry');
  const form = useForm();

  return (
    <ModalOverlay isDismissable>
      <Modal className="react-aria-Modal flex min-h-[420px] flex-col overflow-auto sm:max-w-lg">
        <Dialog className="react-aria-Dialog flex h-full grow flex-col">
          <div className="mb-6">
            <Heading slot="title">Add Expense</Heading>
            <CloseDialog />
          </div>
          <Form
            control={form}
            className="flex grow flex-col"
            action={Paths.EXPENSE}
            transformData={(data) => {
              if (data.expenses.length ===  1) {
                data.description = data.expenses[0].description;
              }
              return data;
            }}
          >
            <HiddenField name="description" value="." />
            <HiddenField name="currency" value="PKR" />
            <HiddenField name="datetime:now" value="." />

            {currentStep === 'entry' && (
              <ExpenseEntry
                onNext={() => {
                  if ((form.getValues('expenses')?.length ?? 0) === 1) {
                    setCurrentStep('single-expense-shares');
                  } else {
                    setCurrentStep('expense-shares');
                  }
                }}
              />
            )}
            {currentStep === 'single-expense-shares' && (
              <FieldScope name="expenses.0">
                <div className="grow">
                  <SingleExpenseShares />
                </div>
                <div className="-mx-4 mt-4 flex justify-between px-4 pt-2 sm:-mx-6 sm:px-6">
                  <Button
                    slot={null}
                    variant="outline"
                    onPress={() => setCurrentStep('entry')}
                  >
                    <ChevronLeftIcon className="size-4" />
                    Back
                  </Button>
                  <Button type="submit">
                    <CheckIcon className="size-4" />
                    Add Expense
                  </Button>
                </div>
              </FieldScope>
            )}
          </Form>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
