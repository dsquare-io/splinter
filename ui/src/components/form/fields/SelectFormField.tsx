import type { ComponentProps } from 'react';
import { ComboBox } from 'react-aria-components';

import { FormField } from '../FormField';
import { MergeFormFieldProps } from './types';

export function SelectFormField(props: MergeFormFieldProps<ComponentProps<typeof ComboBox>>) {
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
    ...comboBoxProps
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
      <ComboBox
        allowsEmptyCollection
        {...comboBoxProps}
      />
    </FormField>
  );
}
