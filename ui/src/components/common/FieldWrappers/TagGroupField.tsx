import {ComponentProps} from 'react';
import {Provider, FieldErrorContext as RACFieldErrorContext, TagGroup} from 'react-aria-components';
import {useController} from 'react-hook-form';

import {useScopedFieldName} from '@/components/common';
import {MergeFormFieldProps} from '@/components/common/FieldWrappers/types';
import {FieldErrorContext} from '@/components/common/Form/FieldError';
import {messagifyValidationRules} from '@/components/common/Form/validations';


type TagGroupFieldProps = MergeFormFieldProps<ComponentProps<typeof TagGroup>>;

export function TagGroupField({
  name,
  deps,
  min,
  max,
  minLength,
  maxLength,
  required,
  pattern,
  selectedKeys,
  onSelectionChange,
  selectionMode = 'multiple',
  children,
  ...props
}: TagGroupFieldProps) {
  const scopedName = useScopedFieldName(name);
  const {
    field: {value, onBlur, onChange, ref},
    fieldState: {invalid, error},
  } = useController({
    name: scopedName,
    defaultValue: selectedKeys ?? new Set(),
    ...props,
    rules: {
      deps,
      ...messagifyValidationRules({
        min,
        max,
        minLength,
        maxLength,
        required,
        pattern,
      }),
    },
  });

  return (
    <Provider
      values={[
        [
          RACFieldErrorContext,
          error
            ? {
                isInvalid: invalid,
                validationErrors: [error.message ?? ''],
                validationDetails: {
                  customError: true,
                  valid: false,
                  badInput: false,
                  patternMismatch: false,
                  rangeOverflow: false,
                  rangeUnderflow: false,
                  stepMismatch: false,
                  tooLong: false,
                  tooShort: false,
                  typeMismatch: false,
                  valueMissing: false,
                },
              }
            : null,
        ],
        [FieldErrorContext, error ?? null],
      ]}
    >
      <TagGroup
        ref={ref}
        onSelectionChange={(...args) => {
          onSelectionChange?.(...args);
          onChange(...args);
          onBlur();
        }}
        data-invalid={invalid}
        selectedKeys={value}
        selectionMode={selectionMode}
        {...props}
      >
        {children}
      </TagGroup>
    </Provider>
  );
}
