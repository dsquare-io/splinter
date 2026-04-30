import type { ComponentProps, ReactNode } from 'react';
import { Radio, RadioGroup } from 'react-aria-components';

import { FieldError, FormField } from '@/components/form';
import type { FieldProps } from '@/components/form/FormField';
import { Label } from '@/components/primitives';

type RadioGroupFormInputProps = Omit<FieldProps, 'children'> & {
  label?: ReactNode;
  options: Array<{ value: string; label: ReactNode }>;
  'aria-label'?: string;
  orientation?: ComponentProps<typeof RadioGroup>['orientation'];
  className?: string;
};

export function RadioGroupFormInput({
  label,
  options,
  'aria-label': ariaLabel,
  orientation = 'horizontal',
  className,
  ...props
}: RadioGroupFormInputProps) {
  return (
    <FormField {...props}>
      {label && <Label>{label}</Label>}
      <RadioGroup
        className={className ?? 'flex rounded-md bg-gray-200 p-1 text-center'}
        orientation={orientation}
        aria-label={ariaLabel}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            className="data-focus-visible:ring-brand-500 w-full rounded-sm px-3 py-2 text-sm font-medium text-gray-600 data-focus-visible:ring-2 data-selected:bg-white data-selected:text-gray-900 data-selected:shadow-xs"
            value={option.value}
          >
            {option.label}
          </Radio>
        ))}
      </RadioGroup>
      <FieldError />
    </FormField>
  );
}
