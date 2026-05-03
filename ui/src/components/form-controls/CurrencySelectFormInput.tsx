import type { ComponentProps } from 'react';

import { ApiRoutes, Currency } from '@/api-types';
import { useApiQuery } from '@/hooks/useApiQuery.ts';
import { SelectFormInput } from './SelectFormInput';

type CurrencySelectFormInputProps = Omit<
  ComponentProps<typeof SelectFormInput<Currency>>,
  'items' | 'idPropName' | 'textValuePropName' | 'ItemComponent'
>;

export function CurrencySelectFormInput(props: CurrencySelectFormInputProps) {
  const { data: currencies = [] } = useApiQuery(ApiRoutes.CURRENCY_LIST);

  return (
    <SelectFormInput<Currency>
      placeholder="Search currencies..."
      {...props}
      items={currencies}
      idPropName="uid"
      textValuePropName="uid"
      ItemComponent={({ item }) => (
        <>
          {item.country.flag} {item.uid}
        </>
      )}
    />
  );
}
