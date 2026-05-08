import { ComponentType } from 'react';

import {
  ArrowUturnLeftIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ReceiptPercentIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

type IconConfig = {
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
};

const ICON_CONFIG: Record<string, IconConfig> = {
  expense: { icon: ReceiptPercentIcon, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  update_expense: { icon: PencilSquareIcon, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  delete_expense: { icon: TrashIcon, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  restore_expense: { icon: ArrowUturnLeftIcon, iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  payment: { icon: BanknotesIcon, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  update_payment: { icon: PencilSquareIcon, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  delete_payment: { icon: TrashIcon, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  restore_payment: { icon: ArrowUturnLeftIcon, iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  settle_up: { icon: CheckCircleIcon, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  restore_activity: { icon: ArrowUturnLeftIcon, iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
  comment: { icon: ChatBubbleLeftRightIcon, iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
};

const FALLBACK_CONFIG: IconConfig = {
  icon: ReceiptPercentIcon,
  iconBg: 'bg-gray-100',
  iconColor: 'text-gray-600',
};

type ActivityVerbIconProps = {
  verb: string;
  className?: string;
  iconClassName?: string;
};

export function ActivityVerbIcon({ verb, className, iconClassName }: ActivityVerbIconProps) {
  const config = ICON_CONFIG[verb] ?? FALLBACK_CONFIG;
  const Icon = config.icon;

  return (
    <div className={`flex shrink-0 items-center justify-center ${config.iconBg} ${className ?? ''}`}>
      <Icon className={`${config.iconColor} ${iconClassName ?? ''}`} />
    </div>
  );
}
