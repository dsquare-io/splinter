import { ApiRoutes } from '@/api-types';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { CurrencySelectFormInput } from '@/components/form-controls';
import { useApiQuery } from '@/hooks/useApiQuery.ts';

export default function Preferences() {
  const { data: userCurrency } = useApiQuery(ApiRoutes.CURRENCY_PREFERENCE);

  return (
    <Form
      values={{ currency: userCurrency?.uid }}
      className="@container md:col-span-2"
      method="PUT"
      action={ApiRoutes.CURRENCY_PREFERENCE}
    >
      <FormRootErrors />

      <CurrencySelectFormInput
        name="currency"
        label="Currency"
        placeholder="Select your currency..."
      />

      <SubmitButton className="mt-8">Update Preference</SubmitButton>
    </Form>
  );
}
