import clx from 'clsx';

import {Link} from '@tanstack/react-router';

import {Activity} from '@/api-types/components/schemas';
import Currency from '@/components/Currency.tsx';
import {Avatar} from '@/components/common';

export default function ActivityListItem({
                                             user,
                                             uid,
                                             template,
                                             target,
                                             createdAt
                                         }: Activity) {

    function formatDate(dateString: string) {

        const date = new Date(dateString);
        const now = new Date();

        // @ts-ignore
        const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        let formattedDate;
        if (daysDiff === 0) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            formattedDate = `Today at ${hours}:${minutes} PM`;
        } else if (daysDiff === -1) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            formattedDate = `Yesterday at ${hours}:${minutes} PM`;
        } else {
            const options: Intl.DateTimeFormatOptions = {
                day: 'numeric',
                month: 'long',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            };
            formattedDate = date.toLocaleDateString('en-US', options);
        }

        return formattedDate;
    }

    return (
        <Link
            to="/activity/$activity"
            params={{activity: uid}}
            className={clx(
                'relative block w-full px-6 py-4 hover:bg-gray-100 data-[status]:bg-brand-50',
                'border-y border-gray-200',
                '[&.active]:z-10 [&.active]:border-brand-200',
                target.value?.length == 0 ? 'item-center' : 'items-start'
            )}
        >
            <div className="flex items-center gap-x-3">
                <Avatar
                    className="size-9"
                    fallback={user.fullName}
                />
                <div>
                    <div className="text-md">{template}</div>
                    <div className="flex gap-2 items-center">
                        <div className="text-md text-gray-400">
                            {+(target.value ?? '0') > 0 ? 'You lent' : 'You borrowed'}
                        </div>
                        <Currency
                            currency="PKR"
                            value={target?.value ?? 0}
                        />
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(createdAt ?? "")}</span>
                </div>
            </div>
        </Link>
    );
}
