import { ListBoxItem } from 'react-aria-components';

import { ApiRoutes, Currency } from '@/api-types';
import { Form, FormRootErrors } from '@/components/form';
import { SelectFormInput } from '@/components/form-controls';
import { Button } from '@/components/primitives';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

export default function Preferences() {
  const { data: currencies } = useApiQuery(ApiRoutes.CURRENCY_LIST);
  const { data: userCurrency } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);

  if (!currencies) return null;

  return (
    <Form
      values={{ currency: userCurrency?.uid }}
      className="@container md:col-span-2"
      method="PUT"
      action={ApiRoutes.CURRENCY_PREFERENCE}
    >
      <FormRootErrors />

      <SelectFormInput
        name="currency"
        label="Currency"
        placeholder="Select your currency..."
        defaultItems={currencies}
      >
        {(currency: Currency) => (
          <ListBoxItem
            id={currency.uid}
            textValue={`${currency.country.flag} ${currency.uid}`}
          >
            {currency.country.flag} {currency.uid}
          </ListBoxItem>
        )}
      </SelectFormInput>

      <Button
        className="mt-8"
        type="submit"
      >
        Update Preference
      </Button>
    </Form>
  );
}
