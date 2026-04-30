import { Text, TextProps } from 'react-aria-components';

import { twMerge } from 'tailwind-merge';

export function Description(props: TextProps) {
  return (
    <Text
      {...props}
      slot="description"
      className={twMerge('mt-1.5 block text-xs text-gray-600', props.className)}
    />
  );
}
