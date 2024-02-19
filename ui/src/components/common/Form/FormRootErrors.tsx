import {useFormContext} from 'react-hook-form';

export function FormRootErrors() {
  const form = useFormContext();

  return form.formState.errors?.root?.message;
}
