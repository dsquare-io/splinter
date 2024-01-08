import clx from 'clsx';

import {Avatar} from '@components/Avatar.tsx';
import {Link} from '@tanstack/react-router';

interface GroupItemProps {
    id: string;
    name: string;
    balance: number;
    currency: string;
    expense: Array<{ id: number; name: string; balance: number, currency: string; }>;
}

export default function GroupListItem({id, name, balance, currency, expense}: GroupItemProps) {
    return (
        <Link
            to="/groups/$group"
            params={{group: id}}
            className={clx("px-6 py-3 flex gap-x-3 hover:bg-neutral-100 data-[status]:bg-blue-50",
                expense.length == 0 ? "item-center" : "items-start")}
        >
            <Avatar className="size-12 rounded-lg" fallback="AF"/>
            <div className="grow text-sm font-medium text-slate-800">
                {name}
                <div className="mt-1 text-xs font-normal text-slate-400">
                    {(balance === 0 || expense.length == 0) ? (
                        <p><span className="text-sky-700 font-medium">Settled up</span></p>
                    ) : undefined}
                    {expense.slice(0, 2).map((e) => (
                        <>
                            {(balance === 0) ? (
                                <p key={e.id}><span className="text-sky-700 font-medium">Settled up</span></p>
                            ) : undefined}
                            {(balance != 0 && e.balance > 0) ? (
                                <p key={e.id}>{e.name.split(" ")[0]}. borrowed <span
                                    className="text-green-700 font-medium">{e.currency} {e.balance}</span></p>
                            ) : undefined}
                            {(balance != 0 && e.balance < 0) ? (
                                <p key={e.id}>you lent {e.name.split(" ")[0]}. <span
                                    className="text-rose-700 font-medium">{e.currency} {e.balance}</span></p>
                            ) : undefined}
                        </>
                    ))}
                    {expense.length > 2 ? (
                        <p className="font-light text mt-1 text-slate-400">and {expense.length - 2} more</p>
                    ) : undefined}
                </div>
            </div>
            {(balance === 0 || expense.length == 0) && (
                <div className="text-xs text-blue-800">
                    Settled up
                </div>
            )}
            {(balance > 0 && expense.length != 0) && (
                <div className="text-right">
                    <div className="text-xs text-slate-400">You lent</div>
                    <div className="text-sm text-green-700">{currency} {balance}</div>
                </div>
            )}
            {(balance < 0 && expense.length != 0) && (
                <div className="text-right">
                    <div className="text-xs text-slate-400">You borrowed</div>
                    <div className="text-sm text-rose-700">{currency} {balance}</div>
                </div>
            )}
        </Link>
    );
}
