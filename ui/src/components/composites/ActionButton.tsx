import { useState, type ComponentProps, type ComponentType, type ReactNode } from 'react';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

import { ErrorAlert } from '@/components/ErrorAlert.tsx';
import { Button, Spinner } from '@/components/primitives';
import { useConfirmation, type ConfirmationOptions } from '@/hooks/useConfirmation.ts';

type ActionButtonProps = {
  isDisabled?: boolean;
  onClick: () => Promise<void>;
  children: ReactNode;
  doneMessage?: string;
  confirmation?: Omit<ConfirmationOptions, 'callback'>;
  IconComponent: ComponentType<{ className?: string; 'data-slot': string }>;
  color?: ComponentProps<typeof Button>['color'];
};

export function ActionButton({
  isDisabled = false,
  onClick,
  children,
  IconComponent,
  doneMessage,
  confirmation,
  color,
}: ActionButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const confirm = useConfirmation();

  const handleClick = async () => {
    if (confirmation) {
      const confirmed = await confirm(confirmation);
      if (!confirmed) return;
    }

    setIsPending(true);
    setIsComplete(false);
    setError(null);
    try {
      await onClick();
      setIsComplete(true);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <ErrorAlert error={error} />
      <Button
        type="button"
        variant="plain"
        color={color}
        isDisabled={isPending || isDisabled}
        onClick={handleClick}
        className="flex w-full justify-start gap-x-4"
      >
        {isPending ? (
          <Spinner />
        ) : isComplete ? (
          <CheckCircleIcon
            data-slot="icon"
            className="text-green-500"
          />
        ) : (
          <IconComponent data-slot="icon" />
        )}
        {isComplete && doneMessage ? doneMessage : children}
      </Button>
    </>
  );
}
