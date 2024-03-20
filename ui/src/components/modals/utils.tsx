import {useContext} from 'react';
import {OverlayTriggerStateContext} from 'react-aria-components';

import {XMarkIcon} from '@heroicons/react/24/outline';

export function CloseDialog() {
  const state = useContext(OverlayTriggerStateContext)!;

  return (
    <button
      onClick={() => state.close()}
      className="focus:ring-ring absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
    >
      <XMarkIcon className="size-5" />
    </button>
  );
}
