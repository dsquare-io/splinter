import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

import { ApiRoutes } from '@/api-types';
import { Form, FormRootErrors, HiddenField, SubmitButton } from '@/components/form';
import { Button, DialogHeader, useDialog } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { queryClient } from '@/queryClient.ts';
import { ExpenseEntry } from './ExpenseEntry.tsx';
import {
  ExpenseParticipantsProvider,
  Participant,
  useParticipantsContext,
} from './ExpenseParticipantsContext.tsx';
import { ExpenseShares } from './ExpenseShares.tsx';

type Step = 'entry' | 'shares';

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

  const goToShares = async () => {
    const valid = await trigger();
    if (valid) setStep('shares');
  };

  return (
    <>
      <DialogHeader
        title="Add Expense"
        description={
          step == 'entry'
            ? 'Split costs with friends or a group, equally or customized.'
            : expenseCount == 1
              ? "Select who's splitting this expense. Adjust shares if someone owes more."
              : 'Select who splits each expense. Adjust shares for unequal contributions.'
        }
      />
      <Form
        control={form}
        className="flex flex-col"
        action={ApiRoutes.EXPENSE}
        onSubmitSuccess={async () => {
          await queryClient.invalidateQueries({
            predicate: (query) => query.queryKey.includes('expenses'),
          });
          close();
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

        <div className="-mx-4">
          <FormRootErrors />
        </div>
        {step === 'entry' && <ExpenseEntry />}
        {step === 'shares' && <ExpenseShares />}

        <div className="-mx-4 mt-4 flex justify-between px-4 pt-2 sm:-mx-6 sm:px-6">
          {step === 'entry' ? (
            <>
              <Button
                slot={null}
                variant="outlined"
                onPress={goToShares}
              >
                <AdjustmentsHorizontalIcon className="size-4" />
                Customize splits
              </Button>
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
  participants: Participant[],
  expenseCount: number
) {
  for (let i = 0; i < expenseCount; i++) {
    for (const p of participants) {
      const key = `expenses.${i}.shares:to_dict__user__share.${p.uid}`;
      if (!((getValues(key) as number) > 0)) setValue(key, 1);
    }
  }
}
