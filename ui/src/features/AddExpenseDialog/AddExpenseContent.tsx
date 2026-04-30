import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { CheckIcon, ChevronLeftIcon } from '@heroicons/react/20/solid';

import { ApiRoutes } from '@/api-types';
import { FieldScope, Form, HiddenField } from '@/components/form';
import { Button, DialogHeader, useDialog } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';
import { ExpenseEntry } from './ExpenseEntry.tsx';
import { ExpensesShares } from './ExpensesShares.tsx';
import { SingleExpenseShares } from './SingleExpenseShares.tsx';

export function AddExpenseContent() {
  const { close } = useDialog();
  const { data: preferredCurrency } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);
  const form = useForm();
  const [currentStep, setCurrentStep] = useState('entry');

  return (
    <>
      <DialogHeader title="Add Expense" />
      <Form
        control={form}
        className="flex grow flex-col"
        action={ApiRoutes.EXPENSE}
        onSubmitSuccess={async () => {
          await queryClient.invalidateQueries({
            predicate: (query) => query.queryKey.includes('expenses'),
          });
          close();
          setCurrentStep('entry');
          form.reset();
        }}
      >
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
          <FieldScope name={currentStep.split('::')[1]}>
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
  );
}
