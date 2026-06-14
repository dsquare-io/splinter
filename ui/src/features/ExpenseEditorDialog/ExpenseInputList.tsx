import { useFormContext, useWatch } from 'react-hook-form';

import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

import type { SimpleCurrency } from '@/api-types';
import { FieldArray, FieldArrayItems } from '@/components/form';
import { CurrencyFormInput, TextFormInput } from '@/components/form-controls';
import { Button } from '@/components/primitives';
import { useParticipantsContext } from './ExpenseParticipantsContext.tsx';

interface Props {
  isSimple: boolean;
}

export function ExpenseInputList({ isSimple }: Props) {
  const { hasPreselected } = useParticipantsContext();
  const {
    formState: { errors },
  } = useFormContext();
  const expensesError = (errors.expenses as any)?.root?.message;

  const currencyCode = useWatch({ name: 'currency' }) as string | undefined;
  const currency: SimpleCurrency | undefined = currencyCode ? { uid: currencyCode, urn: '' } : undefined;

  if (!currency) return null;

  return (
    <div className="flex-1">
      <FieldArray
        name="expenses"
        initialItemsCount={1}
        rules={{ validate: (f) => f.length >= 1 || 'Add at least one expense item' }}
      >
        {({ append }) =>
          isSimple ? (
            <div className="space-y-2">
              <CurrencyFormInput
                currency={currency}
                name="expenses.0.amount"
                label="Amount"
                defaultValue={null}
                aria-label="expense amount"
              />
              <Button
                slot={null}
                variant="plain"
                onPress={() => append({ description: '', amount: null }, { shouldFocus: true })}
                className="flex items-center gap-x-1 text-sm text-neutral-500 hover:text-neutral-700"
              >
                <PlusIcon className="size-4" />
                Split into multiple items
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-[2fr_minmax(106px,1fr)_auto] grid-rows-[auto] gap-x-3 gap-y-4">
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
                      currency={currency}
                      name={`expenses.${index}.amount`}
                      defaultValue={null}
                      required
                      aria-label="expense item"
                    />

                    <Button
                      slot="remove"
                      variant="plain"
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
            </div>
          )
        }
      </FieldArray>
      {expensesError && <p className="mt-1.5 text-xs text-red-600">{expensesError}</p>}
    </div>
  );
}
