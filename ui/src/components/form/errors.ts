import type { FieldErrors, FieldValues, UseFormReturn } from 'react-hook-form';

import { isAxiosError } from 'axios';

type DrfErrorObject = { message: string; code: string };
type DrfErrorValue = DrfErrorObject[] | string | DrfErrors | (DrfErrors | null)[];

export type DrfErrors = {
  [key: string]: DrfErrorValue;
};

const API_ERROR_MESSAGE = {
  STATUS_CODE_400: 'Oops, Unexpected error occurred!',
  STATUS_CODE_401: 'We’re sorry, we could not authenticate your identity!',
  STATUS_CODE_403: 'You do not have the rights to access the requested resource!',
  STATUS_CODE_404: 'We’re sorry, we could not find what you requested for!',
  STATUS_CODE_413: 'The file uploaded is too big!',
  STATUS_CODE_500: 'We’re sorry, we could not find the server!',
  STATUS_CODE_UNKNOWN: 'Oops, Something Went Wrong!',
};

export function flattenFieldErrors(errors: FieldErrors, prefix = ''): { key: string; message: string }[] {
  return Object.entries(errors).flatMap(([key, err]) => {
    if (!err) return [];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof err.type === 'string') return [{ key: fullKey, message: (err.message as string) ?? '' }];
    return flattenFieldErrors(err as FieldErrors, fullKey);
  });
}

/**
 * Parses django rest framework errors and transforms them into hook-form's FieldErrors type.
 */
export function translateServerError(error: unknown) {
  function isFieldErrorObject(v: unknown): v is DrfErrorObject {
    return (
      typeof v === 'object' &&
      v !== null &&
      typeof (v as any).message === 'string' &&
      typeof (v as any).code === 'string'
    );
  }

  function handleObject(err: DrfErrors, prefix = ''): FieldErrors {
    const formErrors: FieldErrors = {};

    for (const [fieldName, error] of Object.entries(err)) {
      const key = prefix ? `${prefix}.${fieldName}` : fieldName || 'root';

      if (Array.isArray(error)) {
        const firstNonNull = error.find((e) => e !== null && e !== undefined);
        if (firstNonNull === undefined) continue;

        if (isFieldErrorObject(firstNonNull)) {
          const errObjs = error as DrfErrorObject[];
          formErrors[key] = {
            type: 'validate',
            types: errObjs.reduce(
              (acc, e) => {
                acc[e.code] = e.message;
                return acc;
              },
              {} as Record<string, string>
            ),
            message: errObjs[0].message,
          };
        } else if (typeof firstNonNull === 'string') {
          formErrors[key] = { type: 'validate', message: firstNonNull };
        } else {
          (error as (DrfErrors | null)[]).forEach((item, index) => {
            if (!item) return;
            Object.assign(formErrors, handleObject(item, `${key}.${index}`));
          });
        }
      } else if (typeof error === 'object' && error !== null) {
        if (isFieldErrorObject(error)) {
          formErrors[key] = { type: 'validate', message: error.message };
        } else {
          Object.assign(formErrors, handleObject(error as DrfErrors, key));
        }
      } else {
        formErrors[key] = { type: 'validate', message: error };
      }
    }

    return formErrors;
  }

  if (!isAxiosError(error)) {
    // not an axios error means something in code went wrong.
    return {
      root: {
        type: 'internal',
        message: 'Something went wrong please try again',
      },
    };
  }

  if (error.response) {
    // got a response but without any data.
    // so use status code to display the error message.
    let errorText = 'Something went wrong please try again';

    if (error.response.status === 400) {
      if (error.response.data) {
        // got a response from the server with field errors
        // so decorate errors on respective fields/form root
        return handleObject(error.response.data);
      }

      errorText = API_ERROR_MESSAGE.STATUS_CODE_400;
    } else if (error.response.status === 401) {
      errorText = API_ERROR_MESSAGE.STATUS_CODE_401;
    } else if (error.response.status === 403) {
      errorText = API_ERROR_MESSAGE.STATUS_CODE_403;
    } else if (error.response.status === 404) {
      errorText = API_ERROR_MESSAGE.STATUS_CODE_404;
    } else if (error.response.status === 413) {
      errorText = API_ERROR_MESSAGE.STATUS_CODE_403;
    } else if (error.response.status >= 500) {
      errorText = API_ERROR_MESSAGE.STATUS_CODE_500;
    }

    return {
      root: {
        type: 'internal',
        message: errorText,
      },
    };
  }

  if (error.request) {
    // so request was constructed properly but got no response
    // means most probably network error
    return {
      root: {
        type: 'network',
        message: 'Something went wrong please check your internet connection and try again.',
      },
    };
  }

  return {
    root: {
      type: 'internal',
      message: 'Something went wrong please try again',
    },
  };
}

export function handleSubmissionError<TFieldValues extends FieldValues = FieldValues>(
  error: unknown,
  control: UseFormReturn<TFieldValues>
) {
  const fieldErrors = translateServerError(error);
  const values = control.getValues();
  let hasNonFieldErrors = false;

  for (const [field, fieldError] of Object.entries(fieldErrors)) {
    if (field in values || field.startsWith('root.') || field === 'root') {
      control.setError(field as any, fieldError as any);
    } else {
      hasNonFieldErrors = true;
      control.setError(`form.${field}`, fieldError as any);
    }
  }

  if (!fieldErrors.root && hasNonFieldErrors) {
    control.setError('root', {
      type: 'internal',
      message: API_ERROR_MESSAGE.STATUS_CODE_400,
    });
  }
}
