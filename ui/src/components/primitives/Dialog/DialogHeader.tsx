import { ReactNode, useContext } from 'react';
import { Heading, OverlayTriggerStateContext } from 'react-aria-components';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { IconButton } from '../Button';

type DialogHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
};

export function DialogHeader({ title, description }: DialogHeaderProps) {
  const { close } = useContext(OverlayTriggerStateContext)!;
  return (
    <div className="mb-6 flex items-start justify-between gap-6">
      <div>
        <Heading slot="title">{title}</Heading>
        {description && <p className="text-sm text-neutral-500">{description}</p>}
      </div>

      <IconButton
        variant="plain"
        aria-label="Close Dialog"
        onPress={close}
      >
        <XMarkIcon className="size-5" />
      </IconButton>
    </div>
  );
}
