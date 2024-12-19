import {ReactNode} from 'react';
import {
  CheckboxContext,
  CheckboxGroupContext,
  ComboBoxContext,
  NumberFieldContext,
  Provider,
  RadioGroupContext,
  SliderContext,
  SwitchContext,
  TextFieldContext,
} from 'react-aria-components';
import {type RegisterOptions, type UseControllerProps, useController} from 'react-hook-form';

import {FieldErrorContext} from './FieldError';
import {useScopedFieldName} from './FieldScope';
import {getFocusableRef} from './utils';
import {messagifyValidationRules} from './validations';

export type FieldProps = {
  children?: ReactNode;
  required?: RegisterOptions['required'];
  deps?: RegisterOptions['deps'];
  pattern?: RegisterOptions['pattern'];
  min?: RegisterOptions['min'];
  max?: RegisterOptions['max'];
  minLength?: RegisterOptions['minLength'];
  maxLength?: RegisterOptions['maxLength'];
  validate?: RegisterOptions['validate'];
} & Omit<UseControllerProps, 'rules'>;

/**
 * This component help integrate react-hook-form with react-aria-fields.
 *
 * how exactly?
 * the solution is quite dumb but works well enough. We provide context values
 * for every possible react aria field. It covers binding field value, invalid state
 * and validation triggers with react aria fields. but we still have to take care of
 * refs (to focus the field on error) and the actual error message.
 *
 * For ref we manually traverse the dom tree after rendering and pass the input ref
 * to react-hook-form.
 *
 * For error messages we have to override FieldError component from react-aria,
 * provide to a custom context and utilize it in the FieldError component.
 *
 * @constructor
 */
export function FormField({
  children,
  min,
  max,
  minLength,
  maxLength,
  required,
  pattern,
  deps,
  name,
  ...props
}: FieldProps) {
  const scopedName = useScopedFieldName(name);
  const {
    field: {value, onBlur, onChange, ref},
    fieldState: {invalid, error},
  } = useController({
    name: scopedName,
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
        [FieldErrorContext, error ?? null],
        [
          CheckboxContext,
          {
            value: value,
            onChange: onChange,
            ref,
            isInvalid: invalid,
            validationBehavior: 'aria',
            name: scopedName,
            isRequired: !!required,
          },
        ],
        [
          CheckboxGroupContext,
          {
            value: value,
            onChange: onChange,
            ref: (el) => el && ref(getFocusableRef(el)),
            isInvalid: invalid,
            validationBehavior: 'aria',
            name: scopedName,
            isRequired: !!required,
          },
        ],
        [
          RadioGroupContext,
          {
            value: value,
            onBlur,
            onChange,
            ref: (el) => el && ref(getFocusableRef(el)),
            isInvalid: invalid,
            validationBehavior: 'aria',
            name: scopedName,
            isRequired: !!required,
          },
        ],
        [
          SliderContext,
          {
            value: value,
            onChange,
            ref: (el) => el && ref(getFocusableRef(el)),
            // todo: handle name and isRequired
          },
        ],
        [
          SwitchContext,
          {
            value: value,
            onBlur,
            onChange,
            ref,
            name: scopedName,
            // todo: handle isRequired
          },
        ],
        [
          TextFieldContext,
          {
            value: value,
            onBlur,
            onChange,
            isInvalid: invalid,
            ref: (el) => el && ref(getFocusableRef(el)),
            validationBehavior: 'aria',
            name: scopedName,
            isRequired: !!required,
          },
        ],
        [
          NumberFieldContext,
          {
            value: value,
            onBlur,
            onChange,
            isInvalid: invalid,
            ref: (el) => el && ref(getFocusableRef(el)),
            validationBehavior: 'aria',
            name: scopedName,
            isRequired: !!required,
          },
        ],
        [
          ComboBoxContext,
          {
            selectedKey: value,
            onBlur,
            onSelectionChange: onChange,
            isInvalid: invalid,
            ref: (el) => el && ref(getFocusableRef(el)),
            validationBehavior: 'aria',
            name: scopedName,
            isRequired: !!required,
          },
        ],
      ]}
    >
      {children}
    </Provider>
  );
}
