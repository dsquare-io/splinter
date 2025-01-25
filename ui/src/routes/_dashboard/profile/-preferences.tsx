import {Button as BaseButton, ComboBox, ListBox, ListBoxItem, Popover} from 'react-aria-components';

import {ChevronUpDownIcon} from '@heroicons/react/24/outline';

import type {Currency} from '@/api-types';
import {Paths} from '@/api-types/routePaths.ts';
import {Button, FieldError, Form, FormRootErrors, Input, Label} from '@/components/common';
import {FormField} from '@/components/common/Form/FormField.tsx';
import {useApiQuery} from '@/hooks/useApiQuery.ts';

export default function Preferences() {
  const {data: currencies} = useApiQuery(Paths.CURRENCY_LIST);
  const {data: userCurrency} = useApiQuery(Paths.CURRENCY_PREFERENCE);

  if (!currencies) return null;

  return (
    <Form
      values={{currency: userCurrency?.uid}}
      className="@container md:col-span-2"
      method="PUT"
      action={Paths.CURRENCY_PREFERENCE}
    >
      <FormRootErrors />

      <FormField name="currency">
        <ComboBox defaultItems={currencies}>
          <Label>Currency</Label>
          <div className="relative">
            <Input placeholder="Select your currency..." />
            <BaseButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </BaseButton>
          </div>
          <FieldError />

          <Popover className="react-aria-Popover w-(--trigger-width)">
            <ListBox className="-mx-4 -my-2 text-sm text-gray-900">
              {(currency: Currency) => (
                <ListBoxItem
                  id={currency.uid}
                  textValue={`${currency.country.flag} ${currency.uid}`}
                >
                  {currency.country.flag} {currency.uid}
                </ListBoxItem>
              )}
            </ListBox>
          </Popover>
        </ComboBox>
      </FormField>

      <Button
        className="mt-8"
        type="submit"
      >
        Update Preference
      </Button>
    </Form>
  );
}
