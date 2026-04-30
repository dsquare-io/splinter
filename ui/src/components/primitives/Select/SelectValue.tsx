import type { ComponentType } from 'react';
import { ComboBoxValue, Tag, TagGroup, TagList } from 'react-aria-components';

import { XMarkIcon } from '@heroicons/react/24/outline';

import type { SelectItemRenderProps } from '@/components/primitives/Select/types.ts';
import { IconButton } from '../Button';

type SelectValueProps<T extends Record<string, any>> = {
  idPropName: string;
  textValuePropName: string;
  ItemComponent?: ComponentType<SelectItemRenderProps<T>>;
};

export function SelectValue<T extends Record<string, any>>({
  idPropName,
  textValuePropName,
  ItemComponent,
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
            className="react-aria-TagGroup mt-4 flex flex-wrap items-center gap-x-2 gap-y-1"
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
