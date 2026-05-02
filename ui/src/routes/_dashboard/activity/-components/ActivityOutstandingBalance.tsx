import { SimpleCurrency } from '@/api-types';
import { Money } from '@/components/primitives';

type ActivityOutstandingBalanceProps = {
  balance?: string | null;
  verb: string;
  currency: SimpleCurrency;
};

export function ActivityOutstandingBalance({ balance, verb, currency }: ActivityOutstandingBalanceProps) {
  if (!balance) {
    return null;
  }

  const balanceNumber = +balance;

  const isPayment = ['payment', 'update_payment', 'delete_payment'].includes(verb);
  if (isPayment) {
    return (
      <p className="mt-1 font-normal text-green-700">
        {balanceNumber > 0 ? 'You paid ' : 'You received '}
        <Money
          currency={currency}
          value={Math.abs(balanceNumber)}
        />
      </p>
    );
  }

  return balanceNumber > 0 ? (
    <p className="mt-1 font-normal text-green-700">
      You received{' '}
      <Money
        currency={currency}
        value={balanceNumber}
      />
    </p>
  ) : (
    <p className="mt-1 font-normal text-red-600">
      You borrowed{' '}
      <Money
        currency={currency}
        value={balanceNumber}
      />
    </p>
  );
}
