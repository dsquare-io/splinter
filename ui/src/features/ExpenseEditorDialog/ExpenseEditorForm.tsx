import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { ChevronLeftIcon } from '@heroicons/react/20/solid';
import { AdjustmentsHorizontalIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

import { ApiRoutes, type SimpleUser } from '@/api-types';
import type { Expense } from '@/api-types/components/schemas';
import { urlWithArgs } from '@/api-types/url';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { Button, DialogFooter, DialogHeader, IconButton, useDialog } from '@/components/primitives';
import { AttachmentContext, useAttachmentContext } from '@/features/AttachmentPanel/Context.tsx';
import { useAttachment } from '@/features/AttachmentPanel/useAttachment.ts';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { invalidateQueriesForExpense } from '@/queryClient.ts';
import { ExpenseEntry } from './ExpenseEntry.tsx';
import { ExpenseOptions } from './ExpenseOptions.tsx';
import { ExpenseParticipantsProvider, useParticipantsContext } from './ExpenseParticipantsContext.tsx';
import { ExpenseShares } from './ExpenseShares.tsx';

type Step = 'entry' | 'shares' | 'options';

interface Props {
  expense?: Expense;
}

function buildDefaultValues(expense: Expense) {
  const dt = new Date(expense.datetime);
  const pad = (n: number) => String(n).padStart(2, '0');
  const datetimeLocal = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;

  return {
    description: expense.description ?? '',
    paidBy: expense.paidBy.uid,
    currency: expense.currency.uid,
    'datetime:iso': datetimeLocal,
    group: expense.group || undefined,
    version: expense.version,
    expenses: expense.expenses.map((exp) => ({
      description: exp.description,
      amount: parseFloat(exp.amount),
      'shares:to_dict__user__share': Object.fromEntries(exp.shares.map((s) => [s.user, s.share])),
    })),
  };
}

export function ExpenseEditorForm({ expense }: Props) {
  const attachments = useAttachment();

  useEffect(() => {
    if (expense?.attachments) {
      attachments.initialize(expense.attachments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ExpenseParticipantsProvider initialExpense={expense}>
      <AttachmentContext.Provider value={attachments}>
        <ExpenseEditorFormInner expense={expense} />
      </AttachmentContext.Provider>
    </ExpenseParticipantsProvider>
  );
}

function ExpenseEditorFormInner({ expense }: Props) {
  const { close } = useDialog();
  const { data: preferredCurrency } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);
  const { getAttachmentUids, existingAttachments } = useAttachmentContext();
  const form = useForm();
  const { getValues, setValue, trigger, control } = form;
  const [step, setStep] = useState<Step>('entry');
  const { participants } = useParticipantsContext();

  const expenses = useWatch({ control, name: 'expenses' }) as unknown[] | undefined;
  const expenseCount = expenses?.length ?? 0;
  const participantIds = participants.map((p) => p.uid).join(',');

  useEffect(() => {
    if (!expense) return;
    form.reset(buildDefaultValues(expense));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const defaultSharesInitialized = useRef(false);
  const prevParticipantIdsRef = useRef('');
  useEffect(() => {
    if (!participants.length || !expenseCount) return;
    // In edit mode, skip the first fire so pre-populated shares aren't overwritten
    if (expense && !defaultSharesInitialized.current) {
      defaultSharesInitialized.current = true;
      prevParticipantIdsRef.current = participantIds;
      return;
    }

    const prevIds = prevParticipantIdsRef.current ? prevParticipantIdsRef.current.split(',') : [];
    const currentIds = participantIds ? participantIds.split(',') : [];
    const removedIds = prevIds.filter((id) => !currentIds.includes(id));
    for (let i = 0; i < expenseCount; i++) {
      for (const uid of removedIds) {
        setValue(`expenses.${i}.shares:to_dict__user__share.${uid}`, undefined);
      }
    }
    prevParticipantIdsRef.current = participantIds;

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
    if (expense) return;
    const now = new Date();
    const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setValue('datetime:iso', local);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEdit = !!expense;
  const action = isEdit
    ? urlWithArgs(ApiRoutes.EXPENSE_DETAIL, { expense_uid: expense!.uid })
    : ApiRoutes.EXPENSE;

  const goToShares = async () => {
    const valid = await trigger();
    if (valid) setStep('shares');
  };

  const goToOptions = async () => {
    setStep('options');
  };

  const description =
    step === 'entry'
      ? 'Split costs with friends or a group.'
      : step === 'options'
        ? 'Set the currency and date for this expense.'
        : expenseCount === 1
          ? "Select who's splitting this expense. Adjust shares if someone owes more."
          : 'Select who splits each expense. Adjust shares for unequal contributions.';

  return (
    <>
      <DialogHeader
        title={isEdit ? 'Edit Expense' : 'Add Expense'}
        description={description}
        prefix={
          step !== 'entry' && (
            <IconButton
              variant="plain"
              aria-label="Back"
              onPress={() => setStep('entry')}
              className="-ml-1"
            >
              <ChevronLeftIcon className="size-5" />
            </IconButton>
          )
        }
      />
      <Form
        control={form}
        className={clsx('flex flex-1 flex-col', step !== 'entry' && 'mt-4')}
        action={action}
        method={isEdit ? 'PUT' : 'POST'}
        transformData={(data) => {
          const keepUids = existingAttachments.map((a) => a.uid);
          const newUids = getAttachmentUids();
          return { ...data, attachments: [...keepUids, ...newUids] };
        }}
        onSubmitSuccess={async (response, control) => {
          const expenseUid = response.data.uid as string;
          await invalidateQueriesForExpense({ uid: expenseUid, group: control.getValues('group') });
          close();
        }}
      >
        <div className="-mx-6">
          <FormRootErrors className="rounded-none" />
        </div>
        {step === 'entry' && <ExpenseEntry />}
        {step === 'shares' && <ExpenseShares />}
        {step === 'options' && <ExpenseOptions />}

        <DialogFooter className="flex justify-between gap-2 sm:mt-4">
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
          <SubmitButton>{isEdit ? 'Save Changes' : 'Add Expense'}</SubmitButton>
        </DialogFooter>
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
