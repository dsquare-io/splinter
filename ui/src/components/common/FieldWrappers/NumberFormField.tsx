import {ComponentProps} from 'react';
import {NumberField} from 'react-aria-components';
import {FormField} from '@/components/common/Form/FormField';
import {MergeFormFieldProps} from './types';

export function NumberFormField(props: MergeFormFieldProps<ComponentProps<typeof NumberField>>) {
  const {
    name,
    shouldUnregister,
    defaultValue = 0,
    control,
    disabled,
    min,
    max,
    minLength,
    maxLength,
    required,
    pattern,
    deps,
    validate,
    ...textProps
  } = props;

  return (
    <FormField
      {...{
        name,
        shouldUnregister,
        defaultValue,
        control,
        disabled,
        min,
        max,
        minLength,
        maxLength,
        required,
        pattern,
        validate,
        deps,
      }}
    >
      <NumberField {...textProps} />
    </FormField>
  );
}
