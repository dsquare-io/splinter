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

      <SelectFormInput<Currency>
        name="currency"
        label="Currency"
        placeholder="Select your currency..."
        items={currencies}
        textValuePropName="uid"
        ItemComponent={({ item }) => (
          <>
            {item.country.flag} {item.uid}
          </>
        )}
      />

      <Button
        className="mt-8"
        type="submit"
      >
        Update Preference
      </Button>
    </Form>
  );
}
