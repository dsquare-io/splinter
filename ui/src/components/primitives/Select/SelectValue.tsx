import clsx from 'clsx';
import type { ComponentType } from 'react';
import { ComboBoxValue, Tag, TagGroup, TagList } from 'react-aria-components';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { IconButton } from '../Button';
import type { SelectItemRenderProps } from './types.ts';

type SelectValueProps<T extends Record<string, any>> = {
  idPropName: string;
  textValuePropName: string;
  ItemComponent?: ComponentType<SelectItemRenderProps<T>>;
  className?: string;
};

export function SelectValue<T extends Record<string, any>>({
  idPropName,
  textValuePropName,
  ItemComponent,
  className,
}: SelectValueProps<T>) {
  return (
    <ComboBoxValue<T>>
      {({ selectedItems, state }) => {
        const items = selectedItems.filter((si) => si != null);
        if (items.length === 0) return null;

        return (
          <TagGroup
            aria-label="Selected values"
            selectionMode="none"
            className={clsx('react-aria-TagGroup flex flex-wrap items-center gap-x-2 gap-y-1', className)}
            onRemove={(keys) => {
              // Remove keys from ComboBox state.
              if (Array.isArray(state.value)) {
                state.setValue(state.value.filter((k) => !keys.has(k)));
              }
            }}
          >
            <TagList
              items={items}
              className="react-aria-TagList contents"
            >
              {(item) => (
                <Tag
                  id={item[idPropName]}
                  textValue={item[textValuePropName]}
                  className="react-aria-Tag flex shrink-0 items-center gap-x-2 overflow-hidden rounded-md border border-gray-300 pl-2 text-sm text-neutral-700 focus:outline-hidden"
                >
                  {ItemComponent ? (
                    <ItemComponent
                      item={item}
                      renderMode="tag"
                    />
                  ) : (
                    item[textValuePropName]
                  )}
                  <IconButton
                    slot="remove"
                    variant="plain"
                  >
                    <XMarkIcon className="size-4" />
                  </IconButton>
                </Tag>
              )}
            </TagList>
          </TagGroup>
        );
      }}
    </ComboBoxValue>
  );
}
