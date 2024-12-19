import {ComponentProps} from 'react';
import {FormField} from '@/components/common/Form/FormField.tsx';

export type MergeFormFieldProps<T> = Omit<ComponentProps<typeof FormField>, 'children'> &
  Omit<T, keyof Omit<ComponentProps<typeof FormField>, 'children'>>;
