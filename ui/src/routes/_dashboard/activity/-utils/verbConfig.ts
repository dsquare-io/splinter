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

export type VerbConfig = {
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
};

const VERB_CONFIG: Record<string, VerbConfig> = {
  expense: {
    icon: ReceiptPercentIcon,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    label: 'New expense added',
  },
  update_expense: {
    icon: PencilSquareIcon,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    label: 'Expense was updated',
  },
  delete_expense: {
    icon: TrashIcon,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    label: 'Expense was removed',
  },
  settle_up: {
    icon: CheckCircleIcon,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    label: 'All settled up',
  },
  payment: {
    icon: BanknotesIcon,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    label: 'Payment recorded',
  },
  update_payment: {
    icon: PencilSquareIcon,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    label: 'Payment was updated',
  },
  delete_payment: {
    icon: TrashIcon,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    label: 'Payment was removed',
  },
  restore_expense: {
    icon: ArrowUturnLeftIcon,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    label: 'Expense was restored',
  },
  restore_activity: {
    icon: ArrowUturnLeftIcon,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    label: 'Activity was restored',
  },
  comment: {
    icon: ChatBubbleLeftRightIcon,
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-600',
    label: 'New comment',
  },
};

const FALLBACK_CONFIG: VerbConfig = {
  icon: ReceiptPercentIcon,
  iconBg: 'bg-gray-100',
  iconColor: 'text-gray-600',
  label: 'Activity',
};

export function getVerbConfig(verb: string): VerbConfig {
  return VERB_CONFIG[verb] ?? FALLBACK_CONFIG;
}
