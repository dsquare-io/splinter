import { BalanceScopeEnum } from '@/api-types/components/schemas';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Money } from '@/components/primitives';
import { usePrimaryOutstandingBalance } from '@/hooks/usePrimaryOutstandingBalance.ts';

type PrimaryBalanceSummaryProps = {
  scope: BalanceScopeEnum;
  objectUid: string;
};

export function PrimaryOutstandingBalance({ scope, objectUid }: PrimaryBalanceSummaryProps) {
  const { balance, hasSynced } = usePrimaryOutstandingBalance(scope, objectUid);

  if (!hasSynced) {
    return (
      <div className="space-y-1.5 text-right">
        <Skeleton className="ml-auto h-2.5 w-12" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (!balance || +balance.amount === 0) {
    return <div className="text-xs text-gray-400">Settled up</div>;
  }

  return (
    <div className="text-right text-sm">
      <div className="text-xs text-gray-400">{+balance.amount > 0 ? 'You lent' : 'You borrowed'}</div>
      <Money
        currency={balance.currency}
        value={balance.amount}
      />
    </div>
  );
}
