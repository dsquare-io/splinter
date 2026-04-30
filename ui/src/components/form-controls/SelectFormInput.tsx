import { useRef, type ComponentProps, type ComponentType, type ReactNode } from 'react';
import { Button } from 'react-aria-components';

import { ChevronUpDownIcon } from '@heroicons/react/24/outline';

import { FieldError, SelectFormField } from '@/components/form';
import {
  Description,
  Input,
  Label,
  SelectPopover,
  SelectValue,
  type SelectItemRenderProps,
} from '@/components/primitives';

type SelectFormInputProps<T extends Record<string, any>> = Omit<
  ComponentProps<typeof SelectFormField>,
  'children' | 'menuTrigger' | 'items'
> & {
  items: T[];
  idPropName?: string;
  textValuePropName?: string;
  emptyStateMessage?: ReactNode;
  ItemComponent?: ComponentType<SelectItemRenderProps<T>>;
  description?: ReactNode;
  label?: ReactNode;
  placeholder?: string;
};

export function SelectFormInput<T extends Record<string, any>>({
  label,
  description,
  selectionMode = 'single',
  placeholder = 'Type to search...',
  emptyStateMessage = 'No results found',
  items,
  idPropName = 'uid',
  textValuePropName = 'name',
  ItemComponent,
  ...props
}: SelectFormInputProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <SelectFormField
      menuTrigger="focus"
      selectionMode={selectionMode}
      {...props}
    >
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Input
          inpRef={inputRef}
          placeholder={placeholder}
        />
        <Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Button>
      </div>
      {description && <Description>{description}</Description>}
      {selectionMode === 'multiple' && (
        <SelectValue
          idPropName={idPropName}
          textValuePropName={textValuePropName}
          ItemComponent={ItemComponent}
        />
      )}
      <FieldError />
      <SelectPopover
        items={items}
        idPropName={idPropName}
        textValuePropName={textValuePropName}
        ItemComponent={ItemComponent}
        emptyStateMessage={emptyStateMessage}
      />
    </SelectFormField>
  );
}
