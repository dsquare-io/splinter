import type { ComponentProps, ReactNode } from 'react';

import type { SimpleCurrency } from '@/api-types';
import { FieldError, NumberFormField } from '@/components/form';
import { Input, Label } from '@/components/primitives';

type CurrencyFormInputProps = ComponentProps<typeof NumberFormField> & {
  label?: ReactNode;
  currency: SimpleCurrency;
};

export function CurrencyFormInput({ label, currency, ...props }: CurrencyFormInputProps) {
  return (
    <NumberFormField {...props}>
      {label && <Label>{label}</Label>}
      <div className="relative">
        <span className="pointer-events-none absolute inset-0 left-3 z-10 flex items-center text-sm text-gray-500">
          {currency.uid}
        </span>
        <Input
          className="pl-12"
          placeholder="0"
        />
      </div>
      <FieldError />
    </NumberFormField>
  );
}
