import { FieldError as RACFieldError } from 'react-aria-components';
import { type ComponentProps, createContext, useContext } from 'react';
import { type FieldError } from 'react-hook-form';

export const FieldErrorContext = createContext<FieldError | null>(null);

export function FieldError(props: ComponentProps<typeof RACFieldError>) {
  const context = useContext(FieldErrorContext);

  return (
    <RACFieldError {...props}>
      {props.children ?? ((validation) => {
        const RACErrors = validation.validationErrors.join(' ');
        return context?.message ?? RACErrors;
      })}
    </RACFieldError>
  );
}