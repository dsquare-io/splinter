import {BaseSyntheticEvent, ComponentProps} from 'react';
import {SlotProps} from 'react-aria-components';
import {FieldErrors, type FieldValues, UseFormProps, type UseFormReturn} from 'react-hook-form';

export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH';

export interface SubmissionConf {
  method?: Method;
  action?: string;
  headers?: Record<string, string>;
}

interface FormSubmissionProps<SubmitResponse, TFieldValues extends FieldValues, TransformedData> {
  name?: string;
  onInvalid?: (error: FieldErrors, event?: BaseSyntheticEvent) => any | Promise<any>;
  onSubmitSuccess?: (
    res: SubmitResponse | undefined,
    control: UseFormReturn<TFieldValues>
  ) => any | Promise<any>;
  onSubmitError?: (err: unknown, control: UseFormReturn<TFieldValues>) => any;
  headers?:
    | Record<string, string>
    | ((
        data: TransformedData,
        conf: Omit<SubmissionConf, 'headers'>,
        event?: BaseSyntheticEvent
      ) => Record<string, string> | Promise<Record<string, string> | null> | null);
  transformData?: (data: TFieldValues, formRef: UseFormReturn<TFieldValues>) => TransformedData | Promise<TransformedData>;
  action?: string;
  method?: Method;
  onSubmit?: (
    data: TransformedData,
    conf: SubmissionConf,
    event?: BaseSyntheticEvent
  ) => Promise<SubmitResponse> | void;
}

export type FormProps<
  SubmitResponse,
  TFieldValues extends FieldValues,
  TransformedData,
> = FormSubmissionProps<SubmitResponse, TFieldValues, TransformedData> &
  SlotProps &
  ComponentProps<'form'> &
  UseFormProps<TFieldValues> & {
    control?: UseFormReturn<TFieldValues>;
  };
