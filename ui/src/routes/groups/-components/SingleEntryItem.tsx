import {Avatar} from '@components/common/Avatar.tsx';

interface SingleEntryItemProps {
  id: number;
  name: string;
  balance: number;
  currency: string;
}

export default function SingleEntryItem({name, balance, currency}: SingleEntryItemProps) {

  return (
    <div
      // to="/friends/$friend"
      // params={{friend: id.toString()}}
      className="flex items-center gap-x-3 py-3 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex gap-2 items-center justify-center">
        <div className="flex flex-col">
          <p className="uppercase text-[8px]">DEC</p>
          <p className="uppercase text-base text-gray-500">12</p>
        </div>
        <Avatar className="size-9 rounded-lg" fallback="AF" />
      </div>

      <div className="grow text-sm font-regular text-gray-800">
        <p className="text-base font-normal text-gray-700">
          {name}
        </p>

        {balance === 0 ? <p className="text-xs text-gray-400"> All settled up </p> : undefined}
        {balance > 0 ? <p className="text-xs text-gray-400"> Ali Paid <span
          className="font-medium text-green-700">{currency} {balance}</span></p> : undefined}
        {balance < 0 ? <p className="text-xs text-gray-400"> You Paid <span
          className="font-medium text-red-700">{currency} {balance}</span></p> : undefined}


      </div>
      <>
        {balance === 0 && (
          <div className="text-xs text-gray-400">
            Settled up
          </div>
        )}
        {balance > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-400">You lent</div>
            <div className="text-sm text-green-700">{currency} {balance}</div>
          </div>
        )}
        {balance < 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-400">You borrowed</div>
            <div className="text-sm text-rose-700">{currency} {balance}</div>
          </div>
        )}
      </>
    </div>
  );
}
