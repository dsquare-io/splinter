import { ApiRoutes } from '@/api-types';
import { currencyPreference } from '@/collections/currencyPreference.ts';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { CurrencySelectFormInput } from '@/components/form-controls';
import { useCurrencyPreference } from '@/hooks/useCurrencyPreference.ts';
import { syncEntity } from '@/hooks/useEntitySync.ts';

export function Preferences() {
  const { data: userCurrency } = useCurrencyPreference();

  return (
    <Form
      values={{ currency: userCurrency }}
      className="@container md:col-span-2"
      method="PUT"
      action={ApiRoutes.CURRENCY_PREFERENCE}
      onSubmitSuccess={() => syncEntity(currencyPreference)}
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
