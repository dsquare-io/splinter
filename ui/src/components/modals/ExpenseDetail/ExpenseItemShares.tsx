import {ApiRoutes, ChildExpense, ExpenseShare, SimpleCurrency} from '@/api-types';
import Currency from '@/components/Currency';
import {Avatar} from '@/components/common';
import {useApiQuery} from '@/hooks/useApiQuery';

export default function ExpenseItemShares({
  expenseItem,
  currency,
}: {
  expenseItem: ChildExpense;
  currency: SimpleCurrency;
}) {
  return expenseItem.shares.map((shareItem) => (
    <UserShare
      shareItem={shareItem}
      currency={currency}
    />
  ));
}

function UserShare({shareItem, currency}: {shareItem: ExpenseShare; currency: SimpleCurrency}) {
  const {data: userProfile} = useApiQuery(ApiRoutes.FRIEND_DETAIL, {friend_uid: shareItem.user});

  return (
    <div className="group flex items-center gap-x-3 px-4 py-3 transition-colors">
      <Avatar
        className="size-6"
        fallback={userProfile?.fullName ?? shareItem.user}
      />
      <div className="flex flex-1 items-center gap-x-2 text-sm text-gray-900">
        {userProfile?.fullName ?? shareItem.user}

        {shareItem.share !== 1 && (
          <div className="rounded-md bg-gray-100 px-1 py-px text-xs text-gray-600 ring-1 ring-gray-300">
            {shareItem.share}x
          </div>
        )}
      </div>
      <Currency
        noTabularNums
        noColor
        className="text-sm"
        currency={currency.uid}
        value={shareItem.amount}
      />
    </div>
  );
}
