import { type ComponentProps } from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/primitives';

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, 'isPending'>;

export function SubmitButton({ ...props }: SubmitButtonProps) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <Button
      type="submit"
      isPending={isSubmitting}
      {...props}
    />
  );
}
