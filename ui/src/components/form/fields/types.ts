import type { ComponentProps } from 'react';

import { FormField } from '../FormField';

export type MergeFormFieldProps<T> = Omit<ComponentProps<typeof FormField>, 'children'> &
  Omit<T, keyof Omit<ComponentProps<typeof FormField>, 'children'>>;
