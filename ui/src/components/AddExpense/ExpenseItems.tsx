import {NumberField, TextField} from 'react-aria-components';
import {useSelector} from 'react-redux';

import {Input} from '@components/common';

export default function ExpenseItems() {
  const selectedParticipants = useSelector((state) => state.addExpense.participants);
  if (selectedParticipants.length === 0) return null;

  return (
    <div className="flex-1 py-4">
      <div className="grid grid-cols-[1fr_126px] grid-rows-[auto] gap-4">
        <div className="col-span-2 grid grid-cols-subgrid">
          <TextField aria-label="expense item">
            <Input placeholder="Expense Item" />
          </TextField>

          <NumberField
            className="relative"
            aria-label="expense item"
          >
            <span className="pointer-events-none absolute inset-0 left-3 z-10 flex items-center text-sm text-gray-500">
              PKR
            </span>
            <Input
              className="pl-12 text-right"
              placeholder="0"
            />
          </NumberField>
        </div>

        <div className="col-span-2 grid grid-cols-subgrid">
          <TextField aria-label="expense item">
            <Input placeholder="Expense Item" />
          </TextField>
        </div>
      </div>
    </div>
  );
}
