import type { ComponentProps, ReactNode } from 'react';

import { FieldError, TextFormField } from '@/components/form';
import { Description, Input, Label } from '@/components/primitives';

type TextFormInputProps = ComponentProps<typeof TextFormField> &
  Pick<ComponentProps<typeof Input>, 'type' | 'autoComplete' | 'placeholder'> & {
    label?: ReactNode;
    description?: ReactNode;
  };

export function TextFormInput({
  label,
  description,
  type,
  autoComplete,
  placeholder,
  pattern,
  ...props
}: TextFormInputProps) {
  const resolvedPattern = pattern ?? (type === 'email' ? 'email' : type === 'url' ? 'url' : undefined);
  return (
    <TextFormField
      {...props}
      pattern={resolvedPattern}
    >
      {label && <Label>{label}</Label>}
      <Input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />
      {description && <Description>{description}</Description>}
      <FieldError />
    </TextFormField>
  );
}
