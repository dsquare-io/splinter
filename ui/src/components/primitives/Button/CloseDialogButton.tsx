import { useContext } from 'react';
import { OverlayTriggerStateContext } from 'react-aria-components';

import { XMarkIcon } from '@heroicons/react/24/outline';

import { IconButton } from './IconButton.tsx';

export function CloseDialogButton() {
  const state = useContext(OverlayTriggerStateContext)!;

  return (
    <IconButton
      variant="plain"
      aria-label="Close Dialog"
      className="absolute top-4 right-4 opacity-70 transition-opacity hover:opacity-100 sm:top-6 sm:right-6"
      onPress={() => state.close()}
    >
      <XMarkIcon className="size-5" />
    </IconButton>
  );
}
