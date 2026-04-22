import { useContext } from 'react';
import { OverlayTriggerStateContext } from 'react-aria-components';

import { XMarkIcon } from '@heroicons/react/24/outline';

export function CloseDialog() {
  const state = useContext(OverlayTriggerStateContext)!;

  return (
    <button
      onClick={() => state.close()}
      aria-label="Close Dialog"
      className="focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden sm:top-6 sm:right-6"
    >
      <XMarkIcon className="size-5" />
    </button>
  );
}
