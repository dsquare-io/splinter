import * as AvatarPrimitive from '@radix-ui/react-avatar';

import {twc} from 'react-twc';
import {ComponentProps} from 'react';

const AvatarRoot = twc(
  AvatarPrimitive.Root,
)`relative flex items-center text-gray-600 text-sm justify-center shrink-0 overflow-hidden rounded-full ring-1 ring-gray-300`;

const AvatarImage = twc(
  AvatarPrimitive.Image,
)`aspect-square size-full`;

const AvatarFallback = twc(
  AvatarPrimitive.Image,
)`flex size-full items-center justify-center rounded-full bg-gray-50`;


interface AvatarProps extends Omit<ComponentProps<typeof AvatarRoot>, 'children'> {
  img?: string;
  fallback: string;
}

export function Avatar({img, fallback, ...props}: AvatarProps) {
  return (
    <AvatarRoot {...props}>
      {img ? (
        <>
          <AvatarImage src={img} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </>
      ) : fallback}
    </AvatarRoot>
  );
}
