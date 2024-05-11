import {type ComponentProps, ReactNode, createContext, useContext} from 'react';
import {FieldError as RACFieldError, FieldErrorRenderProps} from 'react-aria-components';
import {type FieldError} from 'react-hook-form';

export const FieldErrorContext = createContext<FieldError | null>(null);

interface FieldErrorProps extends Omit<ComponentProps<typeof RACFieldError>, 'children'> {
  children?: ReactNode | ((val: ReactNode, renderProps: FieldErrorRenderProps) => ReactNode);
}

export function FieldError(props: FieldErrorProps) {
  const context = useContext(FieldErrorContext);

  return (
    <RACFieldError {...props}>
      {typeof props.children === 'function' || !props.children
        ? (validation) => {
            const RACErrors = validation.validationErrors.join(' ');
            let renderedMessage: ReactNode = context?.message ?? RACErrors;
            if (typeof props.children === 'function') {
              renderedMessage = props.children(renderedMessage, validation);
            }
            return renderedMessage;
          }
        : props.children}
    </RACFieldError>
  );
}
