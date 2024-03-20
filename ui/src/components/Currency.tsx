import {ComponentProps} from 'react';

import {useNumberFormatter} from '@react-aria/i18n';
import {twMerge} from 'tailwind-merge';

interface Props extends Omit<ComponentProps<'span'>, 'children'> {
  currency: string;
  value: number | string;
}

export default function Currency({value, currency, className, ...props}: Props) {
  const formatter = useNumberFormatter({
    style: 'currency',
    currency,
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
    signDisplay: 'never',
  });

  return (
    <span
      {...props}
      className={twMerge('tabular-nums', className, +value < 0 ? 'text-red-600' : 'text-green-700')}
    >
      {formatter.format(+value)}
    </span>
  );
}
