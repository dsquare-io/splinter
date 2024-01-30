import {ReactNode} from 'react';
import {
  CheckboxContext,
  CheckboxGroupContext,
  NumberFieldContext,
  Provider,
  RadioGroupContext,
  SliderContext,
  SwitchContext,
  TextFieldContext,
} from 'react-aria-components';
import {type RegisterOptions, type UseControllerProps, useController} from 'react-hook-form';

import {FieldErrorContext} from '@components/common/Form/FieldError';
import {messagifyValidationRules} from '@components/common/Form/validations';

const focusableInputElments = [
  'input:not([disabled]):not([type=hidden])',
  'select:not([disabled])',
  'textarea:not([disabled])',
];

const FOCUSABLE_INPUT_ELEMENT_SELECTOR = focusableInputElments.join(':not([hidden]),');

function getFocusableRef(rootNode: HTMLElement) {
  const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      if ((node as HTMLElement).tagName === 'label' && (node as HTMLLabelElement).htmlFor) {
        return NodeFilter.FILTER_ACCEPT;
      }

      if ((node as Element).matches(FOCUSABLE_INPUT_ELEMENT_SELECTOR)) {
        return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_SKIP;
    },
  });

  if (walker.nextNode()) {
    return walker.currentNode as HTMLElement;
  }
  return rootNode;
}

type FieldProps = {
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
export function Field({
  children,
  min,
  max,
  minLength,
  maxLength,
  required,
  pattern,
  deps,
  ...props
}: FieldProps) {
  const {
    field: {value, onBlur, onChange, ref},
    fieldState: {invalid, error},
  } = useController({
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
            name: props.name,
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
            name: props.name,
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
            name: props.name,
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
            name: props.name,
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
            name: props.name,
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
            name: props.name,
            isRequired: !!required,
          },
        ],
      ]}
    >
      {children}
    </Provider>
  );
}
