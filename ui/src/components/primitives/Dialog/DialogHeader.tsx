import { ReactNode, useContext } from 'react';
import { Heading, OverlayTriggerStateContext } from 'react-aria-components';

import { ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { IconButton } from '../Button';

type DialogHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  backButton?: boolean;
};

export function DialogHeader({ title, description, backButton = false }: DialogHeaderProps) {
  const { close } = useContext(OverlayTriggerStateContext)!;
  return (
    <div className={`mb-6 flex gap-4 ${backButton ? 'items-center' : 'items-start'}`}>
      {backButton && (
        <IconButton
          variant="plain"
          aria-label="Go back"
          onPress={close}
          className="-ml-1 sm:hidden"
        >
          <ChevronLeftIcon className="size-5" />
        </IconButton>
      )}

      <div className="flex-1">
        <Heading slot="title">{title}</Heading>
        {description && <p className="text-sm text-neutral-500">{description}</p>}
      </div>

      <IconButton
        variant="plain"
        aria-label="Close Dialog"
        onPress={close}
        className={backButton ? 'max-sm:hidden' : undefined}
      >
        <XMarkIcon className="size-5" />
      </IconButton>
    </div>
  );
}
