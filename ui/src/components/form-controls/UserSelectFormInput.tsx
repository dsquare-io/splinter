import type { ComponentProps } from 'react';

import { type SimpleUser } from '@/api-types';
import { Avatar, UserLabel } from '@/components/primitives';
import { SelectFormInput } from './SelectFormInput.tsx';

type FriendFormInputProps = Pick<
  ComponentProps<typeof SelectFormInput<SimpleUser>>,
  'name' | 'label' | 'selectionMode' | 'defaultValue' | 'placeholder' | 'minLength' | 'required'
> & {
  items?: SimpleUser[];
};

export function UserSelectFormInput({ items, placeholder, ...props }: FriendFormInputProps) {
  return (
    <SelectFormInput<SimpleUser>
      {...props}
      placeholder={placeholder || 'Select friends...'}
      emptyStateMessage="No friends found"
      items={items ?? []}
      ItemComponent={({ item }) => (
        <>
          <Avatar
            className="size-6 bg-neutral-50"
            fallback={item.name}
          />
          <UserLabel user={item} />
        </>
      )}
    />
  );
}
