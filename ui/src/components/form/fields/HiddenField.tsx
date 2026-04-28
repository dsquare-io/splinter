import type { ComponentProps } from 'react';

import { useScopedFieldName } from '../FieldScope';
import { FormField } from '../FormField';
import type { MergeFormFieldProps } from './types';

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
      <input
        hidden={hidden}
        readOnly={readOnly}
        name={scopedName}
        value={value}
        {...restProps}
      />
    </FormField>
  );
}
