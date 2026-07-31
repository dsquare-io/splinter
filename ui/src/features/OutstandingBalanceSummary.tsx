import clx from 'clsx';
import { useState } from 'react';

import { BalanceScopeEnum } from '@/api-types/components/schemas';
import { Skeleton } from '@/components/layout/Skeleton.tsx';
import { Money } from '@/components/primitives';
import { COLLAPSED_BALANCE_COUNT, OutstandingBalanceList } from '@/features/OutstandingBalanceList.tsx';
import { useMediaQuery } from '@/hooks/useMediaQuery.ts';
import { useOutstandingBalances } from '@/hooks/useOutstandingBalances.ts';
import { usePrimaryOutstandingBalance } from '@/hooks/usePrimaryOutstandingBalance.ts';

type OutstandingBalanceSummaryProps = {
  scope: BalanceScopeEnum;
  objectUid: string;
  className?: string;
};

export function OutstandingBalanceSummary({ scope, objectUid, className }: OutstandingBalanceSummaryProps) {
  const { balance, hasSynced } = usePrimaryOutstandingBalance(scope, objectUid);
  const balances = useOutstandingBalances(scope, objectUid);
  const [expanded, setExpanded] = useState(false);

  // Touch targets are tight here, so on phones the whole summary toggles, not just the
  // "and N more" line — which stays the only affordance on pointer devices.
  const isCompact = useMediaQuery('(max-width: 639px)');
  const isExpandable = balances.length > COLLAPSED_BALANCE_COUNT;
  const toggle = () => setExpanded((value) => !value);

  return (
    <div
      className={clx('mt-1', isCompact && isExpandable && 'cursor-pointer select-none', className)}
      onClick={isCompact && isExpandable ? toggle : undefined}
    >
      {!hasSynced ? (
        <Skeleton className="h-5 w-40" />
      ) : !balance || +balance.amount === 0 ? (
        <p className="text-sm text-gray-500">Settled up</p>
      ) : (
        <p className="text-sm text-gray-500">
          {+balance.amount > 0 ? 'Overall you lent ' : 'Overall you borrowed '}
          <Money
            className="text-base font-semibold"
            currency={balance.currency}
            value={balance.amount}
          />
        </p>
      )}

      <OutstandingBalanceList
        scope={scope}
        objectUid={objectUid}
        variant="tree"
        className="mt-1"
        expanded={expanded}
        onToggleExpand={toggle}
      />
    </div>
  );
}
