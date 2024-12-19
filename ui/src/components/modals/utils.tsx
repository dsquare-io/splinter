import {useContext} from 'react';
import {OverlayTriggerStateContext} from 'react-aria-components';

import {XMarkIcon} from '@heroicons/react/24/outline';

export function CloseDialog() {
  const state = useContext(OverlayTriggerStateContext)!;

  return (
    <button
      onClick={() => state.close()}
      aria-label="Close Dialog"
      className="focus:ring-ring absolute right-4 top-4 sm:right-6 sm:top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
    >
      <XMarkIcon className="size-5" />
    </button>
  );
}
