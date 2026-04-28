import { LabelProps, Label as RACLabel } from 'react-aria-components';

import { twMerge } from 'tailwind-merge';

export function Label(props: LabelProps) {
  return (
    <RACLabel
      {...props}
      className={twMerge('mb-1 block text-sm leading-relaxed font-bold text-gray-800', props.className)}
    />
  );
}
