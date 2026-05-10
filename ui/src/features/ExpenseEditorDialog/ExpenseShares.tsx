import { useWatch } from 'react-hook-form';

import { ApiRoutes } from '@/api-types';
import { FieldScope } from '@/components/form';
import { Money } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { SingleExpenseShares } from './SingleExpenseShares.tsx';

type ExpenseWatchValue = { description?: string; amount?: number };

export function ExpenseShares() {
  const { data: preferredCurrency } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);
  const expenses = useWatch({ name: 'expenses' }) as ExpenseWatchValue[] | undefined;

  if (!expenses?.length) return null;

  if (expenses.length === 1) {
    return (
      <FieldScope name="expenses.0">
        <SingleExpenseShares />
      </FieldScope>
    );
  }

  return (
    <div className="space-y-6">
      {expenses.map((expense, i) => (
        <div key={i}>
          <div className="-mx-4 flex items-center justify-between bg-neutral-50 px-4 py-2 sm:-mx-6 sm:px-6">
            <span className="text-sm font-medium text-neutral-800">{expense.description}</span>
            {preferredCurrency && expense.amount != null && (
              <Money
                noColor
                noTabularNums
                value={expense.amount}
                currency={preferredCurrency}
                className="text-sm text-neutral-600"
              />
            )}
          </div>
          <FieldScope name={`expenses.${i}`}>
            <SingleExpenseShares />
          </FieldScope>
        </div>
      ))}
    </div>
  );
}
