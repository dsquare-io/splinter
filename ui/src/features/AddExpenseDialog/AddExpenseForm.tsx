import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { AdjustmentsHorizontalIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

import { ApiRoutes, type SimpleUser } from '@/api-types';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { Button, DialogHeader, useDialog } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { invalidateQueriesForExpense } from '@/queryClient.ts';
import { ExpenseEntry } from './ExpenseEntry.tsx';
import { ExpenseOptions } from './ExpenseOptions.tsx';
import { ExpenseParticipantsProvider, useParticipantsContext } from './ExpenseParticipantsContext.tsx';
import { ExpenseShares } from './ExpenseShares.tsx';

type Step = 'entry' | 'shares' | 'options';

export function AddExpenseForm() {
  return (
    <ExpenseParticipantsProvider>
      <AddExpenseFormInner />
    </ExpenseParticipantsProvider>
  );
}

function AddExpenseFormInner() {
  const { close } = useDialog();
  const { data: preferredCurrency } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);
  const form = useForm();
  const { getValues, setValue, trigger, control } = form;
  const [step, setStep] = useState<Step>('entry');
  const { participants } = useParticipantsContext();

  const expenses = useWatch({ control, name: 'expenses' }) as unknown[] | undefined;
  const expenseCount = expenses?.length ?? 0;
  const participantIds = participants.map((p) => p.uid).join(',');

  useEffect(() => {
    if (!participants.length || !expenseCount) return;
    setDefaultShares(getValues, setValue, participants, expenseCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantIds, expenseCount]);

  useEffect(() => {
    if (preferredCurrency?.uid && !getValues('currency')) {
      setValue('currency', preferredCurrency.uid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferredCurrency?.uid]);

  useEffect(() => {
    const now = new Date();
    const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setValue('datetime:iso', local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToShares = async () => {
    const valid = await trigger();
    if (valid) setStep('shares');
  };

  const goToOptions = async () => {
    setStep('options');
  };

  const description =
    step === 'entry'
      ? 'Split costs with friends or a group, equally or customized.'
      : step === 'options'
        ? 'Set the currency and date for this expense.'
        : expenseCount === 1
          ? "Select who's splitting this expense. Adjust shares if someone owes more."
          : 'Select who splits each expense. Adjust shares for unequal contributions.';

  return (
    <>
      <DialogHeader
        title="Add Expense"
        description={description}
      />
      <Form
        control={form}
        className="flex flex-col"
        action={ApiRoutes.EXPENSE}
        onSubmitSuccess={async (response, control) => {
          await invalidateQueriesForExpense({ uid: response.uid, group: control.getValues('group') });
          close();
        }}
      >
        <div className="-mx-4">
          <FormRootErrors />
        </div>
        {step === 'entry' && <ExpenseEntry />}
        {step === 'shares' && <ExpenseShares />}
        {step === 'options' && <ExpenseOptions />}

        <div className="-mx-4 mt-4 flex justify-between px-4 pt-2 sm:-mx-6 sm:px-6">
          {step === 'entry' ? (
            <>
              <div className="flex gap-2">
                <Button
                  slot={null}
                  variant="outlined"
                  onPress={goToOptions}
                  aria-label="Options"
                >
                  <Cog6ToothIcon className="size-4" />
                </Button>
                <Button
                  slot={null}
                  variant="outlined"
                  onPress={goToShares}
                >
                  <AdjustmentsHorizontalIcon className="size-4" />
                  Customize splits
                </Button>
              </div>
              <SubmitButton>Add Expense</SubmitButton>
            </>
          ) : (
            <Button
              slot={null}
              variant="outlined"
              onPress={() => setStep('entry')}
            >
              <ChevronLeftIcon className="size-4" />
              Back
            </Button>
          )}
        </div>
      </Form>
    </>
  );
}

function setDefaultShares(
  getValues: (name: string) => unknown,
  setValue: (name: string, value: unknown) => void,
  participants: SimpleUser[],
  expenseCount: number
) {
  for (let i = 0; i < expenseCount; i++) {
    for (const p of participants) {
      const key = `expenses.${i}.shares:to_dict__user__share.${p.uid}`;
      if (!((getValues(key) as number) > 0)) setValue(key, 1);
    }
  }
}
