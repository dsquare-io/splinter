import { ForwardedRef, forwardRef, useId } from 'react';
import { ButtonContext } from 'react-aria-components';
import { FormProvider, useForm, type FieldValues } from 'react-hook-form';

import { axiosInstance } from '@/axios';
import { useContextProps } from '@/hooks/useContextProps';
import { FormContext } from './context';
import { handleSubmissionError } from './errors';
import { Provider } from './Provider';
import { applyTransformers } from './transformers';
import type { FormProps, forwardRefType, Method } from './types';

function Form<SubmitResponse = any, TFieldValues extends FieldValues = FieldValues, TransformedData = any>(
  { ...props }: FormProps<SubmitResponse, TFieldValues, TransformedData>,
  ref: ForwardedRef<HTMLFormElement>
) {
  const formId = useId();
  const { onSubmit: formSubmitHandler } = props;

  if (!props.name) {
    props.name = props?.id ?? formId;
  }

  [props, ref] = useContextProps(props, ref, FormContext);

  // useContextProps always merge event handlers
  // but in case of onSubmit we need to override
  // base handler if a direct prop is provided
  if (formSubmitHandler) {
    // eslint-disable-next-line react-hooks/immutability
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
  // todo: throw error if control changes
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
                  isPending:
                    control.formState.isLoading ||
                    control.formState.isSubmitting ||
                    control.formState.isValidating,
                },
              },
            },
          ],
        ]}
      >
        <form
          {...elementProps}
          noValidate={!shouldUseNativeValidation}
          data-form-name={props.name}
          ref={ref}
          onSubmit={control.handleSubmit(async (data, event) => {
            if (event?.isPropagationStopped()) {
              return undefined;
            }

            event?.preventDefault();
            event?.stopPropagation();

            // transform form data data
            const processedData = applyTransformers(data);
            const transformedData = await transformData(processedData, control);
            // if transformData function returns undefined just exit submission
            if (!transformedData) return undefined;

            // resolve headers
            const resolvedHeaders =
              typeof headers === 'function'
                ? await headers(transformedData, { method: method as Method, action }, event)
                : headers;

            if (resolvedHeaders === null) {
              return undefined;
            }

            // call submission handler
            let response: any;
            try {
              response = await onSubmit?.(
                transformedData,
                { method, action, headers: resolvedHeaders },
                event
              );
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

const FormWithRef = (forwardRef as forwardRefType)(Form);
export { FormWithRef as Form };
