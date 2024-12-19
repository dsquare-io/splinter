import {useState} from 'react';
import {Dialog, Heading, Modal, ModalOverlay} from 'react-aria-components';
import {useForm} from 'react-hook-form';

import {CheckIcon, ChevronLeftIcon} from '@heroicons/react/20/solid';

import {Paths} from '@/api-types/routePaths.ts';
import {Button, FieldScope, Form, HiddenField} from '@/components/common';
import {CloseDialog} from '@/components/modals/utils';

import {useApiQuery} from '../../../hooks/useApiQuery.ts';
import ExpenseEntry from './ExpenseEntry.tsx';
import ExpensesShares from './ExpensesShares.tsx';
import {SingleExpenseShares} from './SingleExpenseShares';

export default function AddExpense({onOpenChange}: {onOpenChange?: (open: boolean) => void}) {
  const [currentStep, setCurrentStep] = useState('entry');
  const form = useForm();
  const {data: preferredCurrency} = useApiQuery(Paths.CURRENCY_PREFERENCE);

  return (
    <ModalOverlay isDismissable>
      <Modal
        onOpenChange={onOpenChange}
        className="react-aria-Modal flex min-h-[420px] flex-col overflow-auto sm:max-w-lg"
      >
        <Dialog className="react-aria-Dialog flex h-full grow flex-col">
          {({close}) => (
            <>
              <div className="mb-6">
                <Heading slot="title">Add Expense</Heading>
                <CloseDialog />
              </div>
              <Form
                control={form}
                className="flex grow flex-col"
                action={Paths.EXPENSE}
                transformData={(data) => {
                  if (data.expenses.length === 1) {
                    data.description = data.expenses[0].description;
                  }
                  return data;
                }}
                onSubmitSuccess={() => {
                  close();
                  setCurrentStep('entry');
                  form.reset();
                }}
              >
                <HiddenField
                  name="description"
                  value="."
                />
                <HiddenField
                  name="currency"
                  value={preferredCurrency?.uid}
                />
                <HiddenField
                  name="datetime:now"
                  value="."
                />

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
                        variant="outlined"
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
                {currentStep === 'expense-shares' && (
                  <div>
                    <ExpensesShares onExpenseDetail={(id) => setCurrentStep(`expense-details::${id}`)} />
                    <div className="-mx-4 mt-4 flex justify-between px-4 pt-2 sm:-mx-6 sm:px-6">
                      <Button
                        slot={null}
                        variant="outlined"
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
                  </div>
                )}
                {currentStep.startsWith('expense-details') && (
                  <FieldScope name={currentStep.split('::').at(1)}>
                    <div className="grow">
                      <SingleExpenseShares />
                    </div>
                    <div className="-mx-4 mt-4 flex justify-end px-4 pt-2 sm:-mx-6 sm:px-6">
                      <Button
                        slot={null}
                        type="button"
                        onPress={() => setCurrentStep('expense-shares')}
                      >
                        Done
                      </Button>
                    </div>
                  </FieldScope>
                )}
              </Form>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
