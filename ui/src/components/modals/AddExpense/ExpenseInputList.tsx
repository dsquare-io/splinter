import { useState } from 'react';
import { TextField } from 'react-aria-components';

import { XMarkIcon } from '@heroicons/react/24/outline';
import throttle from 'just-throttle';

import { ApiRoutes } from '@/api-types';
import { Button } from '@/components/common';
import { FieldArray, FieldArrayItems, Input, Label, NumberFormField, TextFormField } from '@/components/form';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

export default function ExpenseItems() {
  const [inpValue, setInptValue] = useState('');
  const { data: preferredCurrency } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);
  if (!preferredCurrency) return null;

  return (
    <div className="flex-1">
      <Label>Expense Items</Label>
      <FieldArray
        name="expenses"
        initialItemsCount={1}
        className="grid grid-cols-[2fr_minmax(106px,1fr)_auto] grid-rows-[auto] gap-x-3 gap-y-4"
      >
        {({ append }) => (
          <>
            <FieldArrayItems className="contents">
              {({ index }) => (
                <div className="col-span-3 grid grid-cols-subgrid">
                  <TextFormField
                    name={`expenses.${index}.description`}
                    aria-label="expense item"
                    autoFocus
                  >
                    <Input placeholder="Expense Item" />
                  </TextFormField>

                  <NumberFormField
                    className="relative"
                    name={`expenses.${index}.amount`}
                    defaultValue={null}
                    aria-label="expense item"
                  >
                    <span className="pointer-events-none absolute inset-0 left-3 z-10 flex items-center text-sm text-gray-500">
                      {preferredCurrency.uid}
                    </span>
                    <Input
                      className="pl-12 text-right"
                      placeholder="0"
                    />
                  </NumberFormField>

                  <Button
                    slot="remove"
                    variant="plain"
                    className="size-[38px]"
                  >
                    <XMarkIcon className="text-neutral-600" />
                  </Button>
                </div>
              )}
            </FieldArrayItems>

            <div className="col-span-2 grid grid-cols-subgrid">
              <TextField
                value={inpValue}
                onChange={(val) => {
                  setInptValue(val);
                  throttle((value) => {
                    append({ description: value }, { shouldFocus: true });
                    setInptValue('');
                  }, 150)(val);
                }}
                aria-label="expense item"
              >
                <Input placeholder="Expense Item" />
              </TextField>
            </div>
          </>
        )}
      </FieldArray>
    </div>
  );
}
