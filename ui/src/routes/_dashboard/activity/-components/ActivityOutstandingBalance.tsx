import { tv } from 'tailwind-variants';

import { SimpleCurrency } from '@/api-types';
import { Money } from '@/components/primitives';

const PAYMENT_VERBS = new Set([
  'payment',
  'receive_payment',
  'update_payment',
  'delete_payment',
  'settle_up',
]);

const balanceStyle = tv({
  base: 'mt-1 font-normal',
  variants: {
    negative: {
      true: 'text-red-600',
      false: 'text-green-700',
    },
    deleted: {
      true: 'line-through',
    },
  },
});

type ActivityOutstandingBalanceProps = {
  balance?: string | null;
  verb: string;
  currency: SimpleCurrency;
};

export function ActivityOutstandingBalance({
  balance: balanceProp,
  verb,
  currency,
}: ActivityOutstandingBalanceProps) {
  if (!balanceProp) return null;

  const amount = +balanceProp;
  const isPayment = PAYMENT_VERBS.has(verb);
  const isPositive = amount > 0;

  const label = isPayment
    ? isPositive
      ? 'You paid'
      : 'You received'
    : isPositive
      ? 'You received'
      : 'You borrowed';

  return (
    <p className={balanceStyle({ negative: isPayment === isPositive, deleted: verb.startsWith('delete_') })}>
      {label}{' '}
      <Money
        currency={currency}
        value={amount}
        noColor
      />
    </p>
  );
}
