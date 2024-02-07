import {ForwardedRef, forwardRef, useId} from 'react';
import {ButtonContext} from 'react-aria-components';
import {type FieldValues, FormProvider, useForm} from 'react-hook-form';

import {Provider} from '@components/common/Provider.tsx';
import {forwardRefType} from '@components/common/types.ts';
import {useContextProps} from '@components/common/use-context-props.ts';

import {axiosInstance} from '@/axios';
import {FormContext} from './context';
import type {FormProps, Method} from './types';
import {handleSubmissionError} from "@components/common/Form/errors.ts";

function Form<SubmitResponse = any, TFieldValues extends FieldValues = FieldValues, TransformedData = any>(
   {...props}: FormProps<SubmitResponse, TFieldValues, TransformedData>,
   ref: ForwardedRef<HTMLFormElement>
) {
  const formId = useId();
  const {onSubmit: formSubmitHandler} = props;

  if (!props.name) {
    props.name = props?.id ?? formId;
  }

  [props, ref] = useContextProps(props, ref, FormContext);

  // useContext always merge event handlers
  // but in case of onSubmit we need to override
  // base handler if a direct prop is provided
  if (formSubmitHandler) {
    props.onSubmit = formSubmitHandler;
  }

  const {
    control: providedControl,

    // submission props
    onInvalid,
    onSubmit = (data, conf) =>
       axiosInstance({
         url: conf.action,
         method: conf.method,
         headers: conf.headers,
         data,
       }),
    onSubmitSuccess,
    onSubmitError,
    headers,
    transformData = (data) => data as unknown as TransformedData,
    action,
    method = 'POST',

    // use form props
    mode,
    reValidateMode,
    defaultValues,
    values,
    resetOptions,
    resolver,
    context,
    shouldFocusError = true,
    shouldUnregister,
    shouldUseNativeValidation,
    progressive,
    criteriaMode,
    delayError,

    ...elementProps
  } = props;

  // todo: handle defaultValues with loading state
  // todo: throw error if control is changes from value to false
  // todo: add support for disableButtonsIfNotDirty

  const internalControl = useForm({
    mode: mode ?? 'onBlur',
    reValidateMode: reValidateMode ?? 'onChange',
    defaultValues,
    values,
    resetOptions,
    resolver,
    context,
    shouldFocusError,
    shouldUnregister,
    shouldUseNativeValidation,
    progressive,
    criteriaMode,
    delayError,
  });

  const control = providedControl || internalControl;

  return (
     <FormProvider {...control}>
       <Provider
          values={[
            [
              ButtonContext,
              {
                slots: {
                  'form-action': {
                    isDisabled:
                       control.formState.isLoading ||
                       control.formState.isSubmitting ||
                       control.formState.isValidating,
                  },
                  reset: {
                    isDisabled:
                       control.formState.isLoading ||
                       control.formState.isSubmitting ||
                       control.formState.isValidating,
                    onPress: () => control.reset(),
                  },
                  submit: {
                    isDisabled:
                       control.formState.isLoading ||
                       control.formState.isSubmitting ||
                       control.formState.isValidating,
                    'data-loading':
                       control.formState.isLoading ||
                       control.formState.isSubmitting ||
                       control.formState.isValidating,
                  } as any,
                },
              },
            ],
          ]}
       >
         <form
            {...elementProps}
            data-form-name={props.name}
            ref={ref}
            onSubmit={control.handleSubmit(async (data, event) => {
              if (event?.isPropagationStopped()) {
                return undefined;
              }

              event?.preventDefault();
              event?.stopPropagation();

              // transform form data data
              const transformedData = await transformData(data);
              // if transformData function returns undefined just exit submission
              if (!transformedData) return undefined;

              // resolve headers
              const resolvedHeaders =
                 typeof headers === 'function'
                    ? await headers(transformedData, {method: method as Method, action}, event)
                    : headers;

              if (resolvedHeaders === null) {
                return undefined;
              }

              // call submission handler
              let response: any;
              try {
                response = await onSubmit?.(transformedData, {method, action, headers: resolvedHeaders}, event);
              } catch (err: unknown) {
                handleSubmissionError(err, control);
                return onSubmitError?.(err, control);
              }

              // call submission success hook
              await Promise.resolve(onSubmitSuccess?.(response, control))?.catch();
              // you need to clear all previous errors on the form
              control.clearErrors();
              return undefined;
            }, onInvalid)}
         />
       </Provider>
     </FormProvider>
  );
}

const Form2 = (forwardRef as forwardRefType)(Form);
export {Form2 as Form};
