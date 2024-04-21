import {ComponentProps} from 'react';
import {NumberField, TextField} from 'react-aria-components';

import {FormField} from '@/components/common/Form/FormField.tsx';
import {useScopedFieldName} from './Form';

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

export function HiddenField(props: Omit<MergeFormFieldProps<ComponentProps<'input'>>, 'defaultValue'>) {
  const {
    name,
    shouldUnregister,
    value,
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
    hidden = true,
    readOnly = true,
    ...restProps
  } = props;

  const scopedName = useScopedFieldName(name);

  return (
    <FormField
      {...{
        name,
        shouldUnregister,
        defaultValue: value,
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
      <input hidden={hidden} readOnly={readOnly} name={scopedName} value={value} {...restProps} />
    </FormField>
  );
}
