import {ComponentProps} from 'react';
import {twc} from 'react-twc';

import * as AvatarPrimitive from '@radix-ui/react-avatar';
import {twMerge} from 'tailwind-merge';

const AvatarRoot = twc(
  AvatarPrimitive.Root
)`relative flex items-center text-gray-600 text-sm justify-center shrink-0 overflow-hidden rounded-full ring-1 ring-gray-300`;

const AvatarImage = twc(AvatarPrimitive.Image)`aspect-square size-full`;

const AvatarFallback = twc(
  AvatarPrimitive.Image
)`flex size-full items-center justify-center rounded-full bg-gray-50`;

interface AvatarProps extends Omit<ComponentProps<typeof AvatarRoot>, 'children'> {
  img?: string;
  fallback?: string;
  className?: string;
}

function getInitials(name?: string) {
  if (!name) return undefined;

  const nameSplit = name.toString().toUpperCase().split(' ').filter(Boolean);
  if (nameSplit.length === 1) {
    return nameSplit[0].slice(0, 2);
  }
  return nameSplit
    .slice(0, 2)
    .map((e) => e[0])
    .join('');
}

function InitialsAvatar({name}: {name?: string}) {
  const initials = getInitials(name);

  return (
    <svg
      className="h-[85%] w-[85%] select-none fill-current text-[48px] font-medium uppercase"
      viewBox="0 0 100 100"
      aria-hidden={name ? undefined : 'true'}
    >
      {name && <title>{name}</title>}
      <text
        x="50%"
        y="50%"
        alignmentBaseline="middle"
        dominantBaseline="middle"
        textAnchor="middle"
        dy=".125em"
      >
        {initials}
      </text>
    </svg>
  );
}

export function Avatar({img, fallback, className, ...props}: AvatarProps) {
  return (
    <AvatarRoot
      {...props}
      className={twMerge('relative size-8', className)}
    >
      {img ? (
        <>
          <AvatarImage src={img} />
          {fallback && (
            <AvatarFallback>
              <InitialsAvatar name={fallback} />
            </AvatarFallback>
          )}
        </>
      ) : (
        <InitialsAvatar name={fallback} />
      )}
    </AvatarRoot>
  );
}
