import { useState } from 'react';
import {TextField} from 'react-aria-components';

import {XMarkIcon} from '@heroicons/react/24/outline';
import throttle from 'just-throttle';

import {Button, Input, NumberFormField, TextFormField} from '@/components/common';
import {FieldArray} from '@/components/common/FieldArray/FieldArray.tsx';
import {FieldArrayItems} from '@/components/common/FieldArray/FieldArrayItems.tsx';

export default function ExpenseItems() {
  const [inpValue, setInptValue] = useState('');

  return (
    <div className="mt-4 flex-1 py-4">
      <FieldArray
        name="expenses"
        initialItemsCount={1}
        className="grid grid-cols-[2fr_minmax(106px,1fr)_auto] grid-rows-[auto] gap-y-4 gap-x-3"
      >
        {({append}) => (
          <>
            <FieldArrayItems className="contents">
              {({index}) => (
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
                      PKR
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
