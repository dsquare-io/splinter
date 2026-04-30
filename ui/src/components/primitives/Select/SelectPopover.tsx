import type { ComponentType, ReactNode } from 'react';
import { ListBox, ListBoxItem, Popover } from 'react-aria-components';

import { CheckIcon } from '@heroicons/react/20/solid';

import type { SelectItemRenderProps } from './types.ts';

type SelectPopoverProps<T extends Record<string, any>> = {
  items: T[];
  idPropName: string;
  textValuePropName: string;
  emptyStateMessage: ReactNode;
  ItemComponent?: ComponentType<SelectItemRenderProps<T>>;
};

export function SelectPopover<T extends Record<string, any>>({
  items,
  idPropName,
  textValuePropName,
  emptyStateMessage,
  ItemComponent,
}: SelectPopoverProps<T>) {
  return (
    <Popover className="react-aria-Popover w-(--trigger-width)">
      <ListBox
        items={items}
        className="-mx-4 -my-2 text-sm text-gray-900"
        renderEmptyState={() => <div className="px-4">{emptyStateMessage}</div>}
      >
        {(item) => (
          <ListBoxItem
            id={item[idPropName]}
            textValue={item[textValuePropName]}
            className="data-selected:bg-brand-50 flex cursor-default items-center gap-x-4 px-4 py-2 select-none data-hovered:bg-gray-50"
          >
            {({ isSelected }) => (
              <>
                {ItemComponent ? (
                  <ItemComponent
                    item={item}
                    renderMode="list"
                  />
                ) : (
                  item[textValuePropName]
                )}
                <CheckIcon className={`ml-auto h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
              </>
            )}
          </ListBoxItem>
        )}
      </ListBox>
    </Popover>
  );
}
