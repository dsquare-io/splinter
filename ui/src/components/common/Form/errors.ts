import type {FieldErrors, FieldValues, UseFormReturn} from 'react-hook-form';

import {isAxiosError} from 'axios';

export type DrfErrors = {
  [key: string]: {message: string; code: string}[] | string;
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

/**
 * Parses django rest framework errors and transforms them into hook-form's FieldErrors type.
 *
 * possible improvement: exactly out the non drf specific error handling like network error
 * or some code level unhandled exception.
 */
export function drfToFieldErrors(error: unknown) {
  /**
   * parses drf error object to hook-form's FieldErrors type
   */
  function handleObject(err: DrfErrors) {
    const formErrors: FieldErrors = {};

    for (const [fieldName, error] of Object.entries(err)) {
      if (Array.isArray(error)) {
        if (typeof error[0]?.message === 'string') {
          formErrors[fieldName || 'root'] = {
            type: 'validate',
            types: error.reduce(
              (acc, e: any) => {
                acc[e.code] = e.message;
                return acc;
              },
              {} as Record<string, any>
            ),
            message: error[0].message,
          };
        } else {
          throw new Error("shouldn't be here.");
        }
      } else if (typeof error === 'object') {
        formErrors[fieldName || 'root'] = {
          type: 'validate',
          message: (error as {message: string; code: string}).message,
        };
      } else if (typeof error === 'string') {
        formErrors[fieldName || 'root'] = {
          type: 'validate',
          message: error,
        };
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

  if (error.response && error.response.data) {
    // got a response from server with field errors
    // so decorate errors on respective fields/form root
    return handleObject(error.response.data);
  }

  if (error.response) {
    // got a response but without any data.
    // so use status code to display the error message.
    let errorText = 'Something went wrong please try again';

    if (error.response.status === 400) {
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
  const fieldErrors = drfToFieldErrors(error);

  for (const [field, fieldError] of Object.entries(fieldErrors)) {
    control.setError(field as any, fieldError);
  }
}
