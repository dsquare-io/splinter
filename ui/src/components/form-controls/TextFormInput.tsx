import { useState, type ComponentProps, type ReactNode } from 'react';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/16/solid';

import { FieldError, TextFormField } from '@/components/form';
import {
  Description,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  Label,
} from '@/components/primitives';

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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const resolvedPattern = pattern ?? (type === 'email' ? 'email' : type === 'url' ? 'url' : undefined);

  return (
    <TextFormField
      {...props}
      pattern={resolvedPattern}
    >
      {label && <Label>{label}</Label>}
      {isPassword ? (
        <InputGroup>
          <Input
            isGrouped
            type={resolvedType}
            autoComplete={autoComplete}
            placeholder={placeholder}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
              className="flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <Input
          type={resolvedType}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
      )}
      {description && <Description>{description}</Description>}
      <FieldError />
    </TextFormField>
  );
}
