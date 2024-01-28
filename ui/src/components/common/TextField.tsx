import {
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
  ValidationResult,
} from 'react-aria-components';
import { useController } from 'react-hook-form';
import { tv } from 'tailwind-variants';
import { Description, FieldError, Input, Label, fieldBorderStyles } from './Field';
import { composeTailwindRenderProps, focusRing } from './utils';
import { messagifyValidationRules } from '@components/common/validations.ts';
import { mergeProps } from '@react-aria/utils';

const inputStyles = tv({
  extend: focusRing,
  base: 'border-2 rounded-md',
  variants: {
    isFocused: fieldBorderStyles.variants.isFocusWithin,
    ...fieldBorderStyles.variants,
  },
});

export interface TextFieldProps extends AriaTextFieldProps {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
}

export function TextField(
  {
    label,
    description,
    errorMessage,
    validationBehavior = 'aria',
    name,
    isRequired,
    minLength,
    maxLength,
    pattern,
    isInvalid,
    ...props
  }: TextFieldProps,
) {
  const { field: { value, onBlur, onChange, ref }, fieldState: { invalid, error } } = useController({
    name: name!,
    defaultValue: '',
    rules: messagifyValidationRules({ required: isRequired, minLength, maxLength, pattern }),
  });

  return (
    <AriaTextField
      {...mergeProps(
        props,
        { name, isRequired, minLength, maxLength, pattern, validationBehavior },
        {onChange, onBlur}
      )}
      value={value}
      isInvalid={isInvalid || invalid}
      className={composeTailwindRenderProps(props.className, 'flex flex-col gap-1')}
    >
      {label && <Label>{label}</Label>}
      <Input inpRef={ref} className={inputStyles}/>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage ?? error?.message}</FieldError>
    </AriaTextField>
  );
}
