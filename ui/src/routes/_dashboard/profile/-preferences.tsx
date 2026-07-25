import { ApiRoutes } from '@/api-types';
import { Form, FormRootErrors, SubmitButton } from '@/components/form';
import { CurrencySelectFormInput } from '@/components/form-controls';
import { currencyPreferenceQueryOptions, useCurrencyPreference } from '@/hooks/useCurrencyPreference.ts';
import { queryClient } from '@/queryClient.ts';

export function Preferences() {
  const { data: userCurrency } = useCurrencyPreference();

  return (
    <Form
      values={{ currency: userCurrency?.uid }}
      className="@container md:col-span-2"
      method="PUT"
      action={ApiRoutes.CURRENCY_PREFERENCE}
      onSubmitSuccess={() =>
        queryClient.invalidateQueries({ queryKey: currencyPreferenceQueryOptions().queryKey })
      }
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
