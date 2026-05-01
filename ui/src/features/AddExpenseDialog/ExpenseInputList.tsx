import { useFormContext } from 'react-hook-form';

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { ApiRoutes } from '@/api-types';
import { FieldArray, FieldArrayItems } from '@/components/form';
import { CurrencyFormInput, TextFormInput } from '@/components/form-controls';
import { Button, Label } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { useParticipantsContext } from './ExpenseParticipantsContext.tsx';

export function ExpenseInputList() {
  const { data: preferredCurrency } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);
  const { hasPreselected } = useParticipantsContext();
  const {
    formState: { errors },
  } = useFormContext();
  const expensesError = (errors.expenses as any)?.root?.message;

  if (!preferredCurrency) return null;

  return (
    <div className="flex-1">
      <Label>Expense Item(s)</Label>
      <FieldArray
        name="expenses"
        initialItemsCount={1}
        className="grid grid-cols-[2fr_minmax(106px,1fr)_auto] grid-rows-[auto] gap-x-3 gap-y-4"
        rules={{ validate: (f) => f.length >= 1 || 'Add at least one expense item' }}
      >
        {({ append, fields }) => (
          <>
            <FieldArrayItems className="contents">
              {({ index }) => (
                <div className="col-span-3 grid grid-cols-subgrid">
                  <TextFormInput
                    name={`expenses.${index}.description`}
                    aria-label="expense item"
                    autoFocus={hasPreselected && index === 0}
                    required
                    placeholder="Expense Item"
                  />

                  <CurrencyFormInput
                    currency={preferredCurrency}
                    name={`expenses.${index}.amount`}
                    defaultValue={null}
                    aria-label="expense item"
                  />

                  <Button
                    slot="remove"
                    variant="plain"
                    isDisabled={fields.length === 1}
                    className="my-auto size-8"
                  >
                    <XMarkIcon className="text-neutral-600" />
                  </Button>
                </div>
              )}
            </FieldArrayItems>

            <div className="col-span-3">
              <Button
                slot={null}
                variant="plain"
                onPress={() => append({ description: '', amount: null }, { shouldFocus: true })}
                className="flex items-center gap-x-1 text-sm text-neutral-500 hover:text-neutral-700"
              >
                <PlusIcon className="size-4" />
                Add Item
              </Button>
            </div>
          </>
        )}
      </FieldArray>
      {expensesError && <p className="mt-1.5 text-xs text-red-600">{expensesError}</p>}
    </div>
  );
}
