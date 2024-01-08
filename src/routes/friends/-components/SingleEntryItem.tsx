import {Avatar} from '@components/Avatar.tsx';
import {Link} from '@tanstack/react-router';

const items = [
    {
        id: 1,
        name: "Fuel",
        balance: 200,
        currency: "PKR"
    },
    {
        id: 2,
        name: "Shopping",
        balance: -400,
        currency: "USD"
    },
    {
        id: 3,
        name: "Food",
        balance: -800,
        currency: "USD",
    },
    {
        id: 4,
        name: "Food",
        balance: 0,
        currency: "USD"
    },
]

export default function SingleEntryItem() {
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
                <Avatar className="size-9 rounded-lg" fallback="AF"/>
            </div>

            <div className="grow text-sm font-regular text-slate-800">
                <p>
                    Item 1
                </p>
                <p className="text-xs text-gray-400">Settle up</p>
            </div>
            {items.map((item) => {
                return (
                    <>
                        {item.balance === 0 && (
                            <div className="text-xs text-slate-400">
                                Settled up
                            </div>
                        )}
                        {item.balance > 0 && (
                            <div className="text-right">
                                <div className="text-xs text-slate-400">You lent</div>
                                <div className="text-sm text-green-700">{item.currency} {item.balance}</div>
                            </div>
                        )}
                        {item.balance < 0 && (
                            <div className="text-right">
                                <div className="text-xs text-slate-400">You borrowed</div>
                                <div className="text-sm text-rose-700">{item.currency} {item.balance}</div>
                            </div>
                        )}
                    </>
                )
            })}

        </div>
    );
}
