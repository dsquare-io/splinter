import {ComponentProps} from 'react';
import {TextField} from 'react-aria-components';
import {FormField} from '@/components/common/Form/FormField';
import {MergeFormFieldProps} from './types';

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
