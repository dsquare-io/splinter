import {ComponentProps} from 'react';
import {NumberField, TextField} from 'react-aria-components';

import {FormField} from '@/components/common/Form/FormField.tsx';

type MergeFormFieldProps<T> = Omit<ComponentProps<typeof FormField>, 'children'> &
  Omit<T, keyof Omit<ComponentProps<typeof FormField>, 'children'>>;

export function TextFormField(props: MergeFormFieldProps<ComponentProps<typeof TextField>>) {
  const {
    name,
    shouldUnregister,
    defaultValue = '',
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
      <TextField {...textProps} />
    </FormField>
  );
}

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
