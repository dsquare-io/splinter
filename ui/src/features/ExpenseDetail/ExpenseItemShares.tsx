import { ChildExpense, ExpenseShare, SimpleCurrency, SimpleUser } from '@/api-types';
import { Avatar, Money, UserLabel } from '@/components/primitives';

function ProportionBar({ shares }: { shares: ExpenseShare[] }) {
  return (
    <div className="mb-1 flex h-0.75 gap-x-1">
      {shares.map((share) => (
        <div
          key={share.user}
          className="h-full rounded-sm bg-gray-300"
          style={{ flex: share.share }}
        />
      ))}
    </div>
  );
}

export function ExpenseItemShares({
  expenseItem,
  currency,
  paidBy,
}: {
  expenseItem: ChildExpense;
  currency: SimpleCurrency;
  paidBy?: SimpleUser;
}) {
  const totalShares = expenseItem.shares.reduce((sum, s) => sum + s.share, 0);
  const count = expenseItem.shares.length;

  return (
    <>
      <ProportionBar shares={expenseItem.shares} />
      <div className="my-1">
        {expenseItem.shares.map((shareItem, index) => {
          const isLast = index === count - 1;
          const verticalClass = isLast ? 'top-0 bottom-1/2' : 'inset-y-0';

          return (
            <div
              key={shareItem.user}
              className="relative flex items-center gap-x-3 py-2.5 pl-6"
            >
              {/* vertical line segment */}
              <div className={`absolute left-2 w-px bg-gray-200 ${verticalClass}`} />
              {/* horizontal branch */}
              <div className="absolute top-1/2 left-2 h-px w-4 -translate-y-px bg-gray-200" />

              <Avatar
                className="size-6 shrink-0"
                fallback={shareItem.userProfile.name}
              />
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-900">
                <UserLabel user={shareItem.userProfile} />

                {paidBy?.uid === shareItem.user && (
                  <span className="rounded-md bg-gray-100 px-1.5 py-px text-xs text-gray-500 ring-1 ring-gray-200">
                    payer
                  </span>
                )}

                {shareItem.share !== 1 && (
                  <span className="rounded-md bg-gray-100 px-1.5 py-px text-xs text-gray-600 ring-1 ring-gray-300">
                    {shareItem.share}/{totalShares}
                  </span>
                )}
              </div>
              <Money
                noTabularNums
                noColor
                className="text-sm"
                currency={currency}
                value={shareItem.amount}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
